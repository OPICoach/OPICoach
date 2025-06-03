import { useRecoilState } from "recoil";
import {
  learningSessionListState,
  learnSessionPkState,
  aiLoadingState,
} from "../../atom/learnAtom";
import { useState } from "react";

const NoteCreate = ({ newNoteTitle, setNewNoteTitle, onCreateNote, onModelChange }) => {
  const [learningSessionList] = useRecoilState(learningSessionListState);
  const [learnSessionId, setLearnSessionId] =
    useRecoilState(learnSessionPkState);
  const [creating, setCreating] = useRecoilState(aiLoadingState);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setAiModel(newModel);
    onModelChange(newModel);
  };

  return (
    <div className="flex items-center mb-6 space-x-4">
      <select
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400  transition cursor-pointer"
        value={learnSessionId || ""}
        onChange={(e) => setLearnSessionId(Number(e.target.value))}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg fill='none' stroke='%236B7280' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "1.2em 1.2em",
        }}
      >
        <option value="" disabled>
          Select Session for Note Creation
        </option>
        {learningSessionList.map((session) => (
          <option key={session.id} value={session.id}>
            {session.title}
          </option>
        ))}
      </select>

      <select
        value={aiModel}
        onChange={handleModelChange}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg fill='none' stroke='%236B7280' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "1.2em 1.2em",
        }}
      >
        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
        <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
      </select>

      <input
        type="text"
        placeholder="Enter new note title"
        className="border border-gray-300 rounded-lg px-3 py-2 flex-grow"
        value={newNoteTitle}
        onChange={(e) => setNewNoteTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCreateNote();
          }
        }}
        disabled={creating}
      />

      <button
        className={`bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50`}
        onClick={onCreateNote}
        disabled={creating}
      >
        {creating ? "Creating..." : "Create"}
      </button>
    </div>
  );
};

export default NoteCreate;
