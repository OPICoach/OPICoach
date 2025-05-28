import SideBar from "../components/sidebar";
import { useNavigate } from "react-router-dom";

const TestStart = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/test/question");
  };

  return (
    <div className="flex flex-row w-screen h-screen">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-start w-full bg-white px-16 relative">
        {/* 제목 */}
        <h1 className="text-4xl font-semibold text-black mb-12">
          Mock OPIc Speaking Test
        </h1>

        {/* 본문 */}
        <div className="text-base text-black leading-relaxed tracking-wide max-w-3xl mb-20">
          <p className="mb-6 font-semibold text-xl">Instructions:</p>
          <p className="space-y-4">
            This is a 15-minute mock OPIc speaking test designed to reflect the official test format. <br />
            You will be asked 3–4 questions, each from a different OPIc question type. <br />
            Listen to each prompt and respond verbally. Your answers will be scored by AI. <br />
            Once the test is over, you’ll receive an estimated score based on the official OPIc grades. <br />
            You can review each question and get detailed feedback with the Chatbot to improve your answers. <br />
            If you want to quit the test, press QUIT button. <br />
            When you're ready, press Start to begin.
          </p>
        </div>

        {/* 버튼 (가운데 정렬) */}
        <div className="flex justify-center w-full">
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md shadow transition"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestStart;
