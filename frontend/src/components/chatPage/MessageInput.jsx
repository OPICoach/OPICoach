import MessageButton from "./MessageButton";
import MenuSettingsButton from "./MenuSettingsButton";

const MessageInput = ({
  value,
  onClick,
  onChange,
  isAILoading,
  onCreateNote,
  onChangeModel,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="flex items-center gap-4 pt-3 pb-2 bg-white">
      <MenuSettingsButton
        onCreateNote={onCreateNote}
        onChangeModel={onChangeModel}
        isDisabled={isAILoading}
      />
      <input
        type="text"
        placeholder="Ask about this lesson..."
        className="flex-1 border border-gray-300 px-4 py-2 rounded-full"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={isAILoading}
      />
      <MessageButton icon={"↑"} onClick={onClick} disabled={isAILoading} />
    </div>
  );
};

export default MessageInput;
