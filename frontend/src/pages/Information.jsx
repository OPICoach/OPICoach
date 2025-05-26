import SideBar from "../components/sideBar/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import { useState } from "react";
import { useRecoilState } from "recoil";
// import { userMessagesInforState, AIMessagesInforState } from "../api/atom.js";

const Information = () => {
  // const [userMessages, setUserMessages] = useRecoilState(
  //   userMessagesInforState
  // );
  // const [AIMessages] = useRecoilState(AIMessagesInforState);
  // const [input, setInput] = useState("");

  // const handleSend = () => {
  //   if (input.trim() === "") return;
  //   setUserMessages([...userMessages, input]);
  //   setInput("");
  // };

  // userMessages, AIMessages를 messages로 합치는 함수
  // const mergeMessages = (userMessages, AIMessages) => {
  //   const messages = [];
  //   let u = 0,
  //     a = 0;
  //   while (u < userMessages.length || a < AIMessages.length) {
  //     if (a < AIMessages.length)
  //       messages.push({ role: "ai", content: AIMessages[a++] });
  //     if (u < userMessages.length)
  //       messages.push({ role: "user", content: userMessages[u++] });
  //   }
  //   return messages;
  // };

  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar />
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-10 select-none">
          Information
        </h2>
        {/* <MessageList messages={mergeMessages(userMessages, AIMessages)} />
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={handleSend}
          isAILoading={false}
        /> */}
      </div>
    </div>
  );
};
export default Information;
