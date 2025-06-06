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
import {
  fetchExamQuestion,
  fetchExamFeedback,
  API_BASE_URL,
} from "../api/api.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { sideBarState } from "../atom/sidebarAtom.js";

const TestStart = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(1);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(new Audio());

  const [timeLeft, setTimeLeft] = useRecoilState(timeLeftState);
  const [isRunning, setIsRunning] = useRecoilState(isRunningState);
  const [audioURL, setAudioURL] = useRecoilState(audioURLState);
  const userPk = useRecoilValue(userPkState);

  const speechSynthesisRef = useRef(window.speechSynthesis);

  const [feedbacks, setFeedbacks] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [examType, setExamType] = useState("default");

  const [recordedBlob, setRecordedBlob] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const [aiModel, setAiModel] = useState("gemini-2.0-flash");

  const open = useRecoilValue(sideBarState);

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAnswers((prev) => [...prev, audioUrl]);
        setUserAnswer("녹음 완료");
        setRecordedBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimeLeft(10);
      setIsRunning(true);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const playQuestion = (question) => {
    if (!audioPlayerRef.current) {
      alert("오디오 재생을 지원하지 않는 브라우저입니다.");
      return;
    }

    const audioBlob = new Blob([question.audio_data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    audioPlayerRef.current.src = audioUrl;
    audioPlayerRef.current.play();

    audioPlayerRef.current.onended = () => {
      URL.revokeObjectURL(audioUrl);
      startRecording();
    };
  };

  const fetchQuestions = async () => {
    if (isLoadingTest) return;

    setIsLoadingTest(true);
    if (!userPk) {
      alert("사용자 정보가 없습니다. 로그인 후 이용해주세요.");
      setIsLoadingTest(false);
      return;
    }

    try {
      const fetchedQuestions = [];
      for (let i = 0; i < numQuestions; i++) {
        const response = await fetchExamQuestion(userPk, aiModel);
        if (response) {
          const questionText = response.headers["x-question-text"];
          const questionNumber = response.headers["x-question-number"];
          const audioData = response.data;

          if (!questionText) {
            console.error("Question text is missing from response headers");
            continue;
          }

          fetchedQuestions.push({
            question: questionText,
            questionNumber: questionNumber,
            audio_data: audioData,
          });
        }
      }

      if (fetchedQuestions.length === 0) {
        alert("문제를 불러오지 못했습니다.");
        return;
      }

      setQuestions(fetchedQuestions);
      setIsTestStarted(true);
      setCurrentQuestionIndex(0);
      setCurrentQuestion(fetchedQuestions[0].question);
      setCurrentQuestionNumber(fetchedQuestions[0].questionNumber);
      setAudioURL(null);
      setFeedbacks([]);
      setIsTestFinished(false);
    } catch (err) {
      console.error("문제 불러오기 실패:", err);
      alert("문제 로딩 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      stopRecording();
      setTimeout(() => {
        if (recordedBlob) {
          handleSubmit();
        }
      }, 500);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isTestStarted || questions.length === 0) return;

    if (currentQuestionIndex >= questions.length) {
      setIsRunning(false);
      setIsTestFinished(true);
      return;
    }

    playQuestion(questions[currentQuestionIndex]);
  }, [currentQuestionIndex, isTestStarted]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setIsFetchingFeedback(true);

      if (!recordedBlob) {
        console.error("No recorded audio available");
        return;
      }

      const feedback = await fetchExamFeedback({
        question: currentQuestion,
        questionNumber: currentQuestionNumber,
        userPk: userPk,
        audioBlob: recordedBlob,
        LLM_model: aiModel,
      });

      if (feedback) {
        setFeedbacks((prev) => [...prev, feedback]);
        if (feedback.progress !== undefined) {
          setProgress(feedback.progress);
        }
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentQuestion(questions[currentQuestionIndex + 1].question);
        setCurrentQuestionNumber(
          questions[currentQuestionIndex + 1].questionNumber
        );
        setRecordedBlob(null);
        setUserAnswer("");
      } else {
        setIsTestFinished(true);
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("답변 제출 중 오류가 발생했습니다.");
    } finally {
      setIsFetchingFeedback(false);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const goToFeedbackPage = async () => {
    try {
      // 피드백 데이터 준비
      const feedbackData = feedbacks.map((feedback, index) => ({
        ...feedback,
        question: questions[index].question,
        questionNumber: questions[index].questionNumber,
        question_audio_path: `question_${userPk}_${questions[index].questionNumber}.mp3`,
        user_answer_audio_path: `user_answer_${userPk}_${questions[index].questionNumber}.mp3`,
        userAnswer: feedback.user_answer, // 사용자 답변 텍스트 추가
      }));

      localStorage.setItem("examFeedbacks", JSON.stringify(feedbackData));

      // 피드백 페이지로 이동
      navigate("/test/feedback");
    } catch (error) {
      console.error("피드백 저장 실패:", error);
      alert("피드백 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>
      <div className="flex-1 flex justify-center items-center bg-white p-6">
        {!isTestStarted ? (
          <div className="flex flex-col justify-center items-center gap-6 p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Please select the number of questions
              <br />
              and AI Model to generate them.
              <br />
              <span className="text-sm text-gray-500">
                (It may take some time.)
              </span>
            </h2>

            <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-xl">
              <div className="flex flex-col items-start gap-1">
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 5, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-start gap-1">
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.5-pro-preview-05-06">
                    Gemini 2.5 Pro
                  </option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchQuestions}
              className={`w-40 py-2 font-semibold rounded-lg text-white transition duration-300 ease-in-out ${
                isLoadingTest
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-600"
              }`}
              disabled={isLoadingTest}
            >
              {isLoadingTest ? "Processing..." : "Start"}
            </button>
          </div>
        ) : isTestFinished ? (
          <div className="max-w-md w-full p-8 bg-white border border-gray-200 rounded-2xl shadow text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 mb-2 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">
                ✔
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Test Completed
              </h2>
              <p className="text-gray-600">
                You can now check your feedback and try again if needed.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={goToFeedbackPage}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
              >
                View Feedback
              </button>
              <button
                onClick={() => {
                  setIsTestStarted(false);
                  setQuestions([]);
                  setFeedbacks([]);
                  setUserAnswer("");
                  setCurrentQuestionIndex(0);
                  setIsTestFinished(false);
                  setAudioURL(null);
                  setIsLoadingTest(false);
                }}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Restart
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-md w-full p-8 bg-white border border-gray-200 rounded-2xl shadow text-center space-y-6 mx-auto">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-800">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="text-lg font-semibold text-gray-600">
                  Time Left:{" "}
                  <span className="text-primary font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => playQuestion(questions[currentQuestionIndex])}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
                >
                  Replay
                </button>

                <button
                  onClick={() => {
                    console.log("Submit button clicked"); // 디버깅용 로그
                    handleSubmit();
                  }}
                  disabled={
                    isFetchingFeedback || !recordedAnswers[currentQuestionIndex]
                  }
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    !recordedAnswers[currentQuestionIndex] || isFetchingFeedback
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isFetchingFeedback ? "Processing..." : "Next"}
                </button>
              </div>

              {isRecording && (
                <div className="text-red-600 font-semibold text-sm animate-pulse">
                  Recording... ({timeLeft} seconds left)
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestStart;
