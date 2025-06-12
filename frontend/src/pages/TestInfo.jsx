import SideBar from "../components/sideBar/SideBar.jsx";
import { useNavigate } from "react-router-dom";
import OnboardingButton from "../components/homePage/OnboardingButton.jsx";
import { sideBarState } from "../atom/sidebarAtom.js";
import { useRecoilState } from "recoil";

const Test = () => {
  const navigate = useNavigate();
  const [open] = useRecoilState(sideBarState);

  return (
    <div className="flex flex-row h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center h-screen">
        <div className="bg-white px-10 py-12 max-w-2xl w-full flex flex-col items-center">
          <h2 className="text-4xl font-semibold text-black mb-10 select-none">
            Mock OPIc Speaking Test
          </h2>
          <div className="w-full">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Instructions
            </h3>
            <ul className="text-gray-700 text-base space-y-6 list-disc list-inside">
              <li>
                This is a mock OPIc speaking test that reflects the official
                test format.
              </li>
              <li>You will be asked the number of questions you selected.</li>
              <li>
                Listen to each prompt and answer verbally. Your responses will
                be scored by AI.
              </li>
              <li>
                After the test, you will receive an estimated score based on
                official OPIc grading.
              </li>
              <li>
                You can review each question and receive detailed AI-generated
                feedback.
              </li>
              <li>
                When you are ready, press the{" "}
                <span className="font-bold text-primary">Start</span> button
                below.
              </li>
            </ul>
          </div>
          <div className="mt-10 w-full flex justify-center">
            <button
              className="px-6 py-2 bg-primary text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transitions"
              onClick={() => navigate("/test/start")}
            >
              Start
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test;
