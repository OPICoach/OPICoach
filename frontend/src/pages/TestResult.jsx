import SideBar from "../components/sidebar";
import { useNavigate } from "react-router-dom";

const TestResult = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/test/question");
  };

  return (
    <div className="flex flex-row w-screen h-screen">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-start w-full bg-white px-16 relative">
        <h1 className="text-4xl font-semibold text-black mb-24">
          Mock OPIc Speaking Test
        </h1>

        <div className="text-xl text-black leading-relaxed tracking-wide max-w-3xl mb-24">
            <p className="space-y-4">
                Your mock test is complete.<br />
                Estimated Level: IH<br />
                You can now get feedback from the chatbot.
                </p>
        </div>


        <div className="flex justify-center w-full">
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md shadow transition"
          >
            Get Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
