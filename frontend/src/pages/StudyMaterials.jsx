import React, { useRef, useState } from "react";
import SideBar from "../components/SideBar.jsx";
import BackButton from "../components/BackButton.jsx";
import useResizeHeight from "../hooks/useResizeHeight.jsx";

const MIN_TOP_HEIGHT = 120; // 최소 본문 높이
const MIN_BOTTOM_HEIGHT = 120; // 최소 입력창 영역 높이

const StudyMaterials = () => {
  const { topHeight, containerRef, handleMouseDown } = useResizeHeight(
    350,
    MIN_TOP_HEIGHT,
    MIN_BOTTOM_HEIGHT
  );

  return (
    <div className="flex flex-row h-screen">
      <SideBar userName="Gildong Hong" />

      <div
        className="flex flex-col w-full bg-white h-screen"
        ref={containerRef}
      >
        <div
          className="overflow-y-auto px-10 pt-4 pb-8 border-b border-gray-200"
          style={{ height: topHeight }}
        >
          <BackButton />
          <h2 className="text-2xl font-semibold mb-4 select-none">
            Study Materials
          </h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line select-none">
            In today's lesson, we discussed how to introduce yourself in various
            situations. The key expressions included: "Let me introduce myself",
            "I am currently working at...", and "In my free time, I enjoy...".
            Additionally, we learned how to adjust tone depending on formality
            level. Practice speaking with clarity and confidence!
          </p>
        </div>

        <div
          className="w-full h-3 select-none cursor-row-resize flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1 rounded-full bg-gray-400" />
        </div>

        {/* 채팅/입력 영역 (남은 공간) */}
        <div
          className="flex flex-col justify-between px-10 py-6"
          style={{ flex: 1, minHeight: MIN_BOTTOM_HEIGHT }}
        >
          <div className="flex flex-col gap-4 overflow-y-auto mb-4">
            <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
              Please tell me more about the difference between formal and
              informal introductions.
            </div>
            <div className="self-end bg-gray-100 p-4 rounded-xl max-w-[60%]">
              Sure! Formal introductions usually start with "Good morning" or
              "Pleased to meet you"...
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Ask about this lesson..."
              className="flex-1 border border-gray-300 px-4 py-2 rounded-full"
            />
            <button className="bg-primary text-white px-5 py-2 rounded-full">
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
