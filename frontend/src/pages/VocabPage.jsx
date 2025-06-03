import React, { useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState } from "recoil";
import { sideBarState } from "../atom/sidebarAtom";
import { fetchVocabQuestion } from "../api/api";

const VocabPage = () => {
  const [open] = useRecoilState(sideBarState);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const userPk = 1; // TODO: 실제 로그인 유저 PK로 교체

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await fetchVocabQuestion(userPk);
      setQuestion(data);
    } catch (e) {
      alert("문제 불러오기 실패");
    }
    setLoading(false);
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
        <h1 className="text-3xl font-bold mb-4">Vocab / Idiom 학습</h1>
        <p className="text-lg text-gray-600 mb-8">여기서 영어 단어와 숙어를 학습할 수 있습니다.</p>
        {question ? (
          <div className="mb-8 text-2xl font-semibold">{question.word}</div>
        ) : null}
        <button
          className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? "로딩 중..." : question ? "다음 문제" : "Start"}
        </button>
      </div>
    </div>
  );
};

export default VocabPage; 