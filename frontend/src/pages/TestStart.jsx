import SideBar from "../components/SideBar.jsx";

const TestTimer = () => {
  return (
    <div className="flex flex-row">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white">
        <div className="w-[200px] h-[200px] border-4 border-primary rounded-full flex items-center justify-center text-4xl font-bold text-black">
          00:17
        </div>
        <div className="flex gap-8 mt-10">
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Start
          </button>
          <button className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestTimer;
