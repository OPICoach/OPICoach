import React, { useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState, useRecoilValue } from "recoil";
import { sideBarState } from "../atom/sidebarAtom";
import { userPkState } from "../atom/authAtoms.js";
import { fetchVocabQuestion } from "../api/api";

function shuffle(array) {
  // 배열을 랜덤하게 섞는 함수
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const VocabStudyPage = () => {
  const [open] = useRecoilState(sideBarState);
  const [choices, setChoices] = useState([]); // 4개의 {word, meaning}
  const [question, setQuestion] = useState(null); // 마지막 쌍
  const [shuffledOptions, setShuffledOptions] = useState([]); // 섞인 선택지 배열
  const [selected, setSelected] = useState(null); // 사용자가 선택한 값
  const [isCorrect, setIsCorrect] = useState(null); // 정답 여부
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("word-to-meaning"); // 문제 유형
  const userPk = useRecoilValue(userPkState);

  const loadQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);

    let data = [];
    let uniqueOptions = new Set();
    let tryCount = 0;
    const maxTries = 10;

    while (tryCount < maxTries) {
      const randomMode =
        Math.random() < 0.5 ? "word-to-meaning" : "meaning-to-word";
      setMode(randomMode);
      data = await fetchVocabQuestion(userPk);
      const options =
        randomMode === "word-to-meaning"
          ? data.map((item) => item.meaning)
          : data.map((item) => item.word);
      uniqueOptions = new Set(options);
      if (uniqueOptions.size === 4) {
        setChoices(data);
        setQuestion(data[3]);
        setShuffledOptions(shuffle(options));
        break;
      }
      tryCount++;
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    if (mode === "word-to-meaning") {
      setIsCorrect(option === question.meaning);
      if (option === question.meaning) {
        setTimeout(() => {
          loadQuestion();
        }, 500);
      } else {
        setTimeout(() => {
          setSelected(null);
          setIsCorrect(null);
        }, 300);
      }
    } else {
      setIsCorrect(option === question.word);
      if (option === question.word) {
        setTimeout(() => {
          loadQuestion();
        }, 500);
      } else {
        setTimeout(() => {
          setSelected(null);
          setIsCorrect(null);
        }, 300);
      }
    }
  };

  return (
    <div className="flex flex-row">
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>
      <div className="flex flex-col w-full h-screen bg-white px-12 mt-10 select-none items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          {question
            ? mode === "word-to-meaning"
              ? `What does "${question.word}" mean?`
              : `"${question.meaning}"의 뜻은 무엇인가요?`
            : "Vocab / Idiom Study"}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {mode === "word-to-meaning"
            ? "문제의 영어 단어를 보고 알맞은 뜻을 고르세요."
            : "문제의 뜻을 보고 알맞은 영어 단어를 고르세요."}
        </p>
        {question && (
          <>
            <div className="grid grid-cols-2 gap-8 mb-10 w-full max-w-2xl">
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full min-h-[90px] text-2xl px-10 py-6 rounded-2xl font-bold border leading-snug transition
                    ${
                      selected === option
                        ? isCorrect
                          ? "bg-green-400 text-white border-green-400"
                          : "bg-red-400 text-white border-red-400"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-blue-100"
                    }
                  `}
                  onClick={() => handleSelect(option)}
                  disabled={!!selected}
                >
                  {option}
                </button>
              ))}
            </div>
            <div
              style={{ minHeight: "2.5rem" }}
              className="mb-6 flex items-center justify-center"
            >
              {selected && (
                <div
                  className={`text-xl font-bold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "정답입니다!" : "오답입니다!"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VocabStudyPage;
