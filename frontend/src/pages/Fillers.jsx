import SideBar from "../components/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { userMessagesFillerState, AIMessagesFillerState } from "../api/atom.js";
import BackButton from "../components/BackButton.jsx";

const Fillers = () => {
  const [userMessages, setUserMessages] = useRecoilState(
    userMessagesFillerState
  );
  const [AIMessages] = useRecoilState(AIMessagesFillerState);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setUserMessages([...userMessages, input]);
    setInput("");
  };

  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col flex-1 px-10 pt-4 pb-8 h-full">
        <BackButton />
        <MessageList userMessages={userMessages} AIMessages={AIMessages} />
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={handleSend}
          isAILoading={false}
        />
      </div>
    </div>
  );
};

export default Fillers;
