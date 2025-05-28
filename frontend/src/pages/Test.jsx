import SideBar from "../components/sideBar/SideBar.jsx";
import { useNavigate } from "react-router-dom";
import OnboardingButton from "../components/homePage/OnboardingButton.jsx";
import { sideBarState } from "../atom/sidebarAtom";
import { useRecoilState } from "recoil";

const Test = () => {
  const navigate = useNavigate();
  const [open] = useRecoilState(sideBarState);

  const handleStart = () => {
    navigate("/test/question");
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="flex flex-row h-screen">
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
>>>>>>> origin/main
      </div>
      <main className="flex flex-col w-full bg-white h-screen">
        <div className=" bg-white px-16 pt-4 pb-4 mt-12">
          <h2 className="text-3xl font-semibold mb-10 select-none">
            Mock OPIc Speaking Test
          </h2>
          <div className="">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Instructions:
            </h2>
            <ul className="text-gray-800 text-base space-y-5 list-disc list-inside">
              <li>
                This is a 15-minute mock OPIc speaking test designed to reflect
                the official test format.
              </li>
              <li>
                You will be asked 3–4 questions, each from a different OPIc
                question type.
              </li>
              <li>
                Listen to each prompt and respond verbally. Your answers will be
                scored by AI.
              </li>
              <li>
                Once the test is over, you'll receive an estimated score based
                on the official OPIc grades.
              </li>
              <li>
                You can review each question and get detailed feedback with the
                Chatbot to improve your answers.
              </li>
              <li>If you want to quit the test, press STOP button.</li>
              <li>When you're ready, press Start to begin.</li>
            </ul>
          </div>
          <div className="flex justify-center mt-6 sm:mt-10 md:mt-14 lg:mt-20">
            <OnboardingButton
              name="Start"
              onClick={() => navigate("/test/teststart")}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test;
