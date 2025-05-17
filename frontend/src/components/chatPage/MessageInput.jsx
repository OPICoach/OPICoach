import MessageButton from "./MessageButton";

const MessageInput = ({ value, onClick, onChange, isAILoading }) => (
  <div className="flex items-center gap-4 pt-3 pb-2 bg-white">
    <input
      type="text"
      placeholder="Ask about this lesson..."
      className="flex-1 border border-gray-300 px-4 py-2 rounded-full"
      value={value}
      onChange={onChange}
    />
    <MessageButton icon={"↑"} onClick={onClick} disabled={isAILoading} />
  </div>
);

export default MessageInput;
