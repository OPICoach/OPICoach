import SideBar from "../components/sideBar/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import { useState } from "react";
import { useRecoilState } from "recoil";

const Note = () => {
  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar />
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-10 select-none">Note</h2>
      </div>
    </div>
  );
};
export default Note;
