import SideBar from "../components/SideBar.jsx";
import sidebarLogo from "../assets/sidebar/sidebarLogo.svg";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userMessagesLearnState } from "../api/atom.js";
import { useState } from "react";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import { useEffect } from "react";

// const learnMenus = [
//   { name: "Study Materials", path: "/learn/studymaterials" },
//   { name: "Learn Fillers", path: "/learn/fillers" },
// ];

const Learn = () => {
  const navigate = useNavigate();
  const [userMessages, setUserMessages] = useRecoilState(
    userMessagesLearnState
  );
  const [AIMessages] = useRecoilState(userMessagesLearnState);
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
    <div className="flex flex-row h-screen bg-white">
      <SideBar />
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-10 select-none">Learn</h2>
        <MessageList messages={mergeMessages(userMessages, AIMessages)} />
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={handleSend}
          isAILoading={false}
        />
      </div>
      {/* <div className="flex flex-col justify-center items-center w-full h-screen bg-white">
        <img
          src={sidebarLogo}
          alt="OPICoach Logo"
          className="w-[200px] shrink-0 mt-[-40px] mb-[100px]"
        />
        <div className="flex flex-col gap-10">
          {learnMenus.map((menu) => (
            <button
              key={menu.name}
              onClick={() => navigate(menu.path)}
              className="w-[300px] h-[80px] bg-gray-100 text-black text-xl rounded-xl hover:bg-gray-200 transition"
            >
              {menu.name}
            </button>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Learn;
