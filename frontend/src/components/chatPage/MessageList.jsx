import React, { useRef, useEffect } from "react";
import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";

const MessageList = ({ userMessages, AIMessages }) => {
  const messagesEndRef = useRef(null);

  // userMessages 또는 AIMessages가 바뀔 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userMessages, AIMessages]);

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
      {/* 상대방 메시지 */}
      {AIMessages.map((msg, idx) => (
        <AIMessage key={`opponent-${idx}`} message={msg} />
      ))}
      {/* 내 메시지 */}
      {userMessages.map((msg, idx) => (
        <UserMessage key={`user-${idx}`} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
