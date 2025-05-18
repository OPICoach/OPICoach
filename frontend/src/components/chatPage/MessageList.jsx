import React, { useRef, useEffect } from "react";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // userMessages 또는 AIMessages가 바뀔 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
      {messages.map((msg, idx) =>
        msg.role === "ai" ? (
          <AIMessage key={`ai-${idx}`} message={msg.content} />
        ) : (
          <UserMessage key={`user-${idx}`} message={msg.content} />
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
