import SideBar from "../components/SideBar.jsx";

const Fillers = () => {
  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col flex-1 px-10 py-8 h-full">
        {/* 메시지 영역 */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
          <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
            Please tell me more about the difference between formal and informal
            introductions.
          </div>
          <div className="self-end bg-gray-100 p-4 rounded-xl max-w-[60%]">
            Sure! Formal introductions usually start with "Good morning" or
            "Pleased to meet you"...
          </div>
        </div>
        {/* 입력창 영역 */}
        <div className="flex items-center gap-4 pt-3 pb-2 bg-white">
          <input
            type="text"
            placeholder="Ask about this lesson..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded-full"
          />
          <button className="bg-primary text-white px-5 py-2 rounded-full">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fillers;
