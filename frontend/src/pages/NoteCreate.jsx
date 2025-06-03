import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLearningNoteAPI } from "../api/learningNoteAPI";
import SideBar from "../components/SideBar";

const NoteCreate = () => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await postLearningNoteAPI({
        user_pk: userPk,
        session_pk: sessionPk,
        title: title,
        LLM_model: aiModel
      });
      console.log("노트 생성 응답:", response);
      navigate("/note");
    } catch (error) {
      console.error("노트 생성 실패:", error);
      alert("노트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white p-6">
        <div className="max-w-xl w-full p-6 bg-yellow-50 border rounded">
          <h2 className="text-2xl font-bold mb-4">Create Note</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Enter note title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isLoading ? "bg-gray-400" : "bg-primary hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Creating..." : "Create Note"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteCreate; 