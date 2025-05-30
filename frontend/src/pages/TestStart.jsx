import SideBar from "../components/sideBar/SideBar.jsx";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  timeLeftState,
  isRunningState,
  audioURLState,
  isRecordingState,
} from "../atom/testAtom.js";
import { userPkState } from "../atom/authAtoms.js";
import axios from "axios";

const TestStart = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [timeLeft, setTimeLeft] = useRecoilState(timeLeftState);
  const [isRunning, setIsRunning] = useRecoilState(isRunningState);
  const [audioURL, setAudioURL] = useRecoilState(audioURLState);
  const [isRecording, setIsRecording] = useRecoilState(isRecordingState);
  const userPk = useRecoilValue(userPkState);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);

  // 🟡 질문 불러오기
  const fetchQuestion = async (index) => {
    try {
      console.log(`👉 질문 ${index + 1} 불러오는 중...`);
      const res = await axios.get(`/api/opic/question?index=${index}`);
      if (res.data && res.data.question) {
        console.log("✅ 질문 불러오기 성공:", res.data.question);
        setCurrentQuestion(res.data.question);
      } else {
        console.warn("⚠️ 질문 없음");
        setCurrentQuestion("");
      }
    } catch (err) {
      console.error("❌ 질문 불러오기 실패:", err);
      setCurrentQuestion("");
    }
  };

  // 🕒 타이머
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      console.log("⏳ 타이머 시작");
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      console.log("🛑 타이머 종료, 자동 녹음 종료");
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, setTimeLeft]);

  // 📌 질문 인덱스 바뀔 때마다 새 질문 가져오기
  useEffect(() => {
    console.log(`🔄 질문 인덱스 바뀜: ${currentQuestionIndex}`);
    if (currentQuestionIndex < 1000) {
      fetchQuestion(currentQuestionIndex);
    }
  }, [currentQuestionIndex]);

  // 🎤 질문 텍스트가 세팅되면 음성 읽고 녹음 시작
  useEffect(() => {
    if (currentQuestionIndex >= 1) {
      console.log("🎉 모든 질문 완료");
      setIsRunning(false);
      alert("모든 질문이 완료되었습니다. 감사합니다!");
      return;
    }

    if (currentQuestion) {
      console.log("📢 질문 읽고 녹음 시작:", currentQuestion);
      playQuestionAndRecord(currentQuestion);
    }
  }, [currentQuestion, currentQuestionIndex]);

  // 📢 질문 읽고 녹음 시작
  const playQuestionAndRecord = (text) => {
    if (!speechSynthesisRef.current) {
      alert("Speech Synthesis를 지원하지 않는 브라우저입니다.");
      return;
    }

    setIsRunning(false);
    setTimeLeft(120);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";

    utterance.onend = () => {
      console.log("🗣️ 질문 읽기 완료");
      startRecording();
      setIsRunning(true);
    };

    console.log("🗣️ 질문 읽기 시작:", text);
    speechSynthesisRef.current.cancel();
    speechSynthesisRef.current.speak(utterance);
  };

  // 🎙️ 녹음 시작
  const startRecording = async () => {
    try {
      console.log("🎙️ 녹음 시작 요청");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        console.log("🛑 녹음 중지, Blob 생성 및 업로드 시작");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("✅ 녹음 시작됨");
    } catch (err) {
      console.error("❌ 마이크 접근 실패:", err);
      alert("마이크 권한이 필요합니다. 설정을 확인해주세요.");
    }
  };

  // 🛑 녹음 중지 + 다음 질문
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("🛑 녹음 중지 요청");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRunning(false);
      setTimeLeft(0);
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // ⬆️ 오디오 업로드
  const uploadAudio = async (audioBlob) => {
    if (!userPk) {
      console.warn("❗ userPk 없음");
      return;
    }

    const formData = new FormData();
    formData.append("userPk", userPk);
    formData.append("audio", audioBlob, `recording_question_${currentQuestionIndex + 1}.wav`);
    formData.append("duration", 120 - timeLeft);
    formData.append("question", currentQuestion);

    try {
      const response = await axios.post("/api/audio/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("⬆️ 오디오 업로드 성공:", response.data);
    } catch (error) {
      console.error("❌ 오디오 업로드 실패:", error);
    }
  };

  // ▶️ 오디오 재생
  const handlePlayAudio = () => {
    if (audioRef.current) {
      console.log("▶️ 오디오 재생");
      audioRef.current.play();
    }
  };

  // ⏱️ 타이머 포맷
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white p-6">
        <div className="mb-8 text-2xl font-bold">
          질문 {currentQuestionIndex + 1} /
        </div>
        <div className="w-[280px] h-[280px] border-4 border-primary rounded-full flex items-center justify-center text-5xl font-bold text-black">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-6 mt-8">
          <button
            onClick={() => {
              if (!isRunning && !isRecording && currentQuestion) {
                console.log("🔁 다시 시작 클릭");
                playQuestionAndRecord(currentQuestion);
              }
            }}
            disabled={isRunning || isRecording || !currentQuestion}
            className={`px-6 py-3 rounded-lg text-white ${
              isRunning || isRecording || !currentQuestion
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:bg-blue-600"
            }`}
          >
            {currentQuestion ? "다시 시작" : "끝"}
          </button>

          <button
            onClick={handlePlayAudio}
            disabled={!audioURL}
            className={`px-6 py-3 rounded-lg ${
              audioURL
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            답변 재생
          </button>
        </div>

        {audioURL && <audio ref={audioRef} src={audioURL} className="hidden" />}
      </div>
    </div>
  );
};

export default TestStart;
