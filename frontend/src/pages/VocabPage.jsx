import React, { useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState, useRecoilValue } from "recoil";
import { userPkState } from "../atom/authAtoms";
import { sideBarState } from "../atom/sidebarAtom";
import { fetchVocabQuestion } from "../api/api";
import { useNavigate } from "react-router-dom";

const VocabPage = () => {
  const [open] = useRecoilState(sideBarState);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/vocab/study");
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
      <div className="flex flex-col w-full h-screen bg-white px-12 select-none items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Vocab / Idiom Study</h1>
        <p className="text-lg text-gray-600">
          You can study English vocabulary and idioms here.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          Questions are provided infinitely.
        </p>
        {question ? (
          <div className="mb-8 text-2xl font-semibold">{question.word}</div>
        ) : null}
        <button
          className="px-6 py-2 bg-primary text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={handleStart}
          disabled={loading}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default VocabPage;
