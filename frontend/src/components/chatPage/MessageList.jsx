import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";

const MessageList = ({ userMessages, AIMessages }) => (
  <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
    {/* 상대방 메시지 */}
    {AIMessages.map((msg, idx) => (
      <AIMessage key={`opponent-${idx}`} message={msg} />
    ))}
    {/* 내 메시지 */}
    {userMessages.map((msg, idx) => (
      <UserMessage key={`user-${idx}`} message={msg} />
    ))}
  </div>
);

export default MessageList;
