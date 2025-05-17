import SideBar from "../components/SideBar.jsx";
import { useNavigate } from "react-router-dom";

const StudyMaterials = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row h-screen">
      <SideBar userName="Gildong Hong" />

      {/* 오른쪽 컨텐츠 영역 */}
      <div className="flex flex-col w-full bg-white">
        {/* 상단 뒤로가기 버튼 */}
        <div className="flex items-center justify-start px-10 pt-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-black hover:underline font-medium"
          >
            <span className="text-[22px] font-medium mr-1">&lt;</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pt-4 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Study Materials</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            In today's lesson, we discussed how to introduce yourself in various
            situations. The key expressions included: "Let me introduce myself",
            "I am currently working at...", and "In my free time, I enjoy...".
            Additionally, we learned how to adjust tone depending on formality
            level. Practice speaking with clarity and confidence!
          </p>
        </div>

        <div className="h-[300px] px-10 py-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4 overflow-y-auto mb-4">
            <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
              Please tell me more about the difference between formal and
              informal introductions.
            </div>
            <div className="self-end bg-gray-100 p-4 rounded-xl max-w-[60%]">
              Sure! Formal introductions usually start with "Good morning" or
              "Pleased to meet you"...
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

export default StudyMaterials;
