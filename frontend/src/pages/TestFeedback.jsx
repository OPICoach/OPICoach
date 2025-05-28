import SideBar from "../components/sidebar";

const TestFeedback = () => {
  return (
    <div className="flex flex-row h-screen">
      <SideBar userName="Gildong Hong" />

      <div className="flex flex-col w-full bg-white p-6">
        <div className="flex flex-col flex-1 justify-between">

          <div className="flex flex-col gap-4 overflow-y-auto mb-4">
            <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
              msg from chatbot
            </div>
            <div className="self-end bg-gray-100 p-4 rounded-xl max-w-[60%]">
              msg from user
            </div>
          </div>

          <div className="flex items-center gap-4">
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
    </div>
  );
};

export default TestFeedback;
