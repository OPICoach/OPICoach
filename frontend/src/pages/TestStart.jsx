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
import { fetchExamQuestion, fetchExamFeedback } from "../api/api.js";

const TestStart = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(1);

  const [timeLeft, setTimeLeft] = useRecoilState(timeLeftState);
  const [isRunning, setIsRunning] = useRecoilState(isRunningState);
  const [audioURL, setAudioURL] = useRecoilState(audioURLState);
  const [isRecording, setIsRecording] = useRecoilState(isRecordingState);
  const userPk = useRecoilValue(userPkState);

  const speechSynthesisRef = useRef(window.speechSynthesis);

  const [feedbacks, setFeedbacks] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  const fetchQuestions = async () => {
    if (!userPk) {
      alert("사용자 정보가 없습니다. 로그인 후 이용해주세요.");
      return;
    }

    try {
      const fetchedQuestions = [];
      for (let i = 0; i < numQuestions; i++) {
        const data = await fetchExamQuestion(userPk);
        if (data && data.question) {
          fetchedQuestions.push(data.question);
        } else {
          console.warn("문제가 응답에 없습니다:", data);
        }
      }

      if (fetchedQuestions.length === 0) {
        alert("문제를 불러오지 못했습니다.");
        return;
      }

      setQuestions(fetchedQuestions);
      setIsTestStarted(true);
      setCurrentQuestionIndex(0);
      setAudioURL(null);
      setFeedbacks([]);
      setUserAnswer("");
      setIsTestFinished(false);
      console.log("시험 문제 불러오기 성공:", fetchedQuestions);
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
      proceedNextQuestion();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isTestStarted || questions.length === 0) return;

    if (currentQuestionIndex >= questions.length) {
      setIsRunning(false);
      setIsTestFinished(true);
      alert("시험이 종료되었습니다!");
      console.log("시험 종료: 모든 질문 완료");
      return;
    }

    playQuestion(questions[currentQuestionIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isTestStarted]);

  const playQuestion = (text) => {
    if (!speechSynthesisRef.current) {
      alert("Speech Synthesis를 지원하지 않는 브라우저입니다.");
      console.error("Speech Synthesis 미지원");
      return;
    }

    speechSynthesisRef.current.cancel();
    setIsRunning(false);
    setTimeLeft(10);
    setAudioURL(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";

    utterance.onend = () => {
      setUserAnswer("Umm...I don't know"); // 추후 음성 입력으로 대체
      setIsRunning(true);
      console.log("질문 재생 완료, 답변 시작");
    };

    utterance.onerror = (e) => {
      console.error("음성 재생 오류:", e);
      alert("음성 재생에 실패했습니다.");
    };

    speechSynthesisRef.current.speak(utterance);
    console.log("질문 음성 재생 시작:", text);
  };

  const proceedNextQuestion = async () => {
    setIsRunning(false);
    setTimeLeft(0);

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswer;

    if (isFetchingFeedback) return;

    setIsFetchingFeedback(true);
    setFeedbacks((prev) => [
      ...prev,
      {
        good_point: "",
        bad_point: "",
        overall_feedback: "",
        teachers_answer: "",
      },
    ]);

    try {
      const feedbackData = await fetchExamFeedback({
        question: currentQuestion,
        user_answer: currentAnswer,
        user_pk: userPk,
      });

      const newFeedback = feedbackData
        ? {
            good_point: feedbackData.good_point || "",
            bad_point: feedbackData.bad_point || "",
            overall_feedback: feedbackData.overall_feedback || "",
            teachers_answer: feedbackData.teachers_answer || "",
          }
        : {
            good_point: "",
            bad_point: "",
            overall_feedback: "",
            teachers_answer: "",
          };

      setFeedbacks((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = newFeedback;
        return copy;
      });
    } catch (error) {
      console.error("피드백 호출 실패:", error);
    } finally {
      setIsFetchingFeedback(false);
    }

    setUserAnswer("");
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const goToFeedbackPage = () => {
    window.location.href = "/test/feedback";
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
            <button
              onClick={fetchQuestions}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Test Start
            </button>
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
              <button
                onClick={proceedNextQuestion}
                disabled={isFetchingFeedback}
                className={`px-4 py-2 rounded text-white ${
                  isFetchingFeedback
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                다음 문제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestStart;
