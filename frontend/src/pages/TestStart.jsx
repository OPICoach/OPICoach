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
import { fetchExamQuestion, fetchExamFeedback, API_BASE_URL } from "../api/api.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TestStart = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
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

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAnswers(prev => [...prev, audioUrl]);
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playQuestion = (question) => {
    if (!audioPlayerRef.current) {
      alert("오디오 재생을 지원하지 않는 브라우저입니다.");
      return;
    }

    const audioBlob = new Blob([question.audio_data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    audioPlayerRef.current.src = audioUrl;
    audioPlayerRef.current.play();
    
    audioPlayerRef.current.onended = () => {
      URL.revokeObjectURL(audioUrl);
      startRecording();
    };
  };

  const fetchQuestions = async () => {
    if (!userPk) {
      alert("사용자 정보가 없습니다. 로그인 후 이용해주세요.");
      return;
    }

    try {
      const fetchedQuestions = [];
      for (let i = 0; i < numQuestions; i++) {
        const response = await fetchExamQuestion(userPk, aiModel);
        if (response) {
          const questionText = response.headers['x-question-text'];
          const questionNumber = response.headers['x-question-number'];
          const audioData = response.data;
          
          if (!questionText) {
            console.error('Question text is missing from response headers');
            continue;
          }
          
          fetchedQuestions.push({
            question: questionText,
            questionNumber: questionNumber,
            audio_data: audioData
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
        LLM_model: aiModel
      });

      if (feedback) {
        setFeedbacks(prev => [...prev, feedback]);
        if (feedback.progress !== undefined) {
          setProgress(feedback.progress);
        }
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestion(questions[currentQuestionIndex + 1].question);
        setCurrentQuestionNumber(questions[currentQuestionIndex + 1].questionNumber);
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
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
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
        userAnswer: feedback.user_answer // 사용자 답변 텍스트 추가
      }));

      localStorage.setItem('examFeedbacks', JSON.stringify(feedbackData));
      
      // 피드백 페이지로 이동
      navigate("/testfeedback");
    } catch (error) {
      console.error("피드백 저장 실패:", error);
      alert("피드백 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white p-6">
        {!isTestStarted ? (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-center">
              문제 개수를 선택하세요
              <br />
              (문제 생성에 시간이 걸릴 수 있습니다.)
            </h2>
            <div className="flex items-center gap-4">
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="px-4 py-2 border rounded-md"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
              </select>
              <button
                onClick={fetchQuestions}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Test Start
              </button>
            </div>
          </div>
        ) : isTestFinished ? (
          <div className="max-w-xl w-full p-6 bg-yellow-50 border rounded text-center">
            <h2 className="text-2xl font-bold mb-4">Test finished.</h2>
            <h3 className="font-semibold mb-2">You can get your feedback.</h3>
            <button
              onClick={goToFeedbackPage}
              className="mt-4 bg-primary text-white px-6 py-3 rounded hover:bg-blue-600"
            >
              Get Feedback
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
              }}
              className="mt-6 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Restart
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 text-2xl font-bold">
              Question {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="mb-4 text-lg font-medium">
              Time Left: {formatTime(timeLeft)}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => playQuestion(questions[currentQuestionIndex])}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                질문 다시 듣기
              </button>
              {recordedAnswers[currentQuestionIndex] && (
                <button
                  onClick={() => {
                    console.log("Submit button clicked");  // 디버깅용 로그
                    handleSubmit();
                  }}
                  disabled={isFetchingFeedback}
                  className={`px-4 py-2 rounded text-white ${
                    isFetchingFeedback
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isFetchingFeedback ? "처리 중..." : "다음 문제"}
                </button>
              )}
            </div>
            {isRecording && (
              <div className="mt-4 text-red-500 font-bold">
                녹음 중... ({timeLeft}초 남음)
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestStart;
