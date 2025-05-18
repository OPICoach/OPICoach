import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import {
  userMessagesMaterialState,
  AIMessagesMaterialState,
} from "../api/atom.js";
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

  const [userMessages, setUserMessages] = useRecoilState(
    userMessagesMaterialState
  );
  const [AIMessages] = useRecoilState(AIMessagesMaterialState);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setUserMessages([...userMessages, input]);
    setInput("");
  };

  // userMessages, AIMessages를 messages로 합치는 함수
  const mergeMessages = (userMessages, AIMessages) => {
    const messages = [];
    let u = 0,
      a = 0;
    while (u < userMessages.length || a < AIMessages.length) {
      if (a < AIMessages.length)
        messages.push({ role: "ai", content: AIMessages[a++] });
      if (u < userMessages.length)
        messages.push({ role: "user", content: userMessages[u++] });
    }
    return messages;
  };

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

        <div
          className="flex flex-col justify-between px-10 py-6"
          style={{ flex: 1, minHeight: MIN_BOTTOM_HEIGHT }}
        >
          <div style={{ flexGrow: 1, overflowY: "auto", marginBottom: "1rem" }}>
            <MessageList messages={mergeMessages(userMessages, AIMessages)} />
          </div>

          <MessageInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onClick={handleSend}
            isAILoading={false}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
