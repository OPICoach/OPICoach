const MessageInput = () => (
  <div className="flex items-center gap-4 pt-3 pb-2 bg-white">
    <input
      type="text"
      placeholder="Ask about this lesson..."
      className="flex-1 border border-gray-300 px-4 py-2 rounded-full"
    />
    <button className="bg-primary text-white px-5 py-2 rounded-full">
      {'\u2191'}
    </button>
  </div>
);

export default MessageInput;