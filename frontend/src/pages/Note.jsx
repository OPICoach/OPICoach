import { useEffect, useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState } from "recoil";
import {
  learningSessionListState,
  learnSessionIdState,
} from "../atom/learnAtom";
import { userPkState } from "../atom/authAtoms";
import {
  getLearningSessionsAPI,
  postLearningNoteAPI,
  getLearningNotesAPI,
  deleteLearningNoteAPI,
} from "../api/api";

// Trash Icon
const TrashIcon = () => (
  <svg
    className="w-4 h-4 inline ml-1 text-gray-400 hover:text-red-500 transition"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
  </svg>
);

const Note = () => {
  const [userPk] = useRecoilState(userPkState);
  const [learningSessionList, setLearningSessionList] = useRecoilState(
    learningSessionListState
  );
  const [learnSessionId, setLearnSessionId] =
    useRecoilState(learnSessionIdState);

  const [noteList, setNoteList] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  // Fetch session list
  useEffect(() => {
    async function fetchSessions() {
      if (!userPk) return;
      setLoading(true);
      try {
        const sessions = await getLearningSessionsAPI(userPk);
        setLearningSessionList(sessions || []);
      } catch (e) {
        setLearningSessionList([]);
      }
      setLoading(false);
    }
    fetchSessions();
  }, [userPk, setLearningSessionList]);

  // Fetch notes list
  const fetchNotes = async () => {
    if (!userPk) return;
    setNoteLoading(true);
    try {
      const notes = await getLearningNotesAPI(userPk);
      setNoteList(notes || []);
    } catch (e) {
      setNoteList([]);
    }
    setNoteLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [userPk]);

  // Select session (do not create note)
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setError("");
  };

  // Create note button
  const handleCreateNote = async () => {
    if (!selectedSession || !userPk) return;
    setCreating(true);
    setError("");
    try {
      await postLearningNoteAPI({
        user_pk: userPk,
        session_id: selectedSession.session_id,
        title: selectedSession.title || "Untitled",
      });
      await fetchNotes();
    } catch (e) {
      setError("Failed to create note.");
    }
    setCreating(false);
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!userPk) return;
    setNoteLoading(true);
    try {
      await deleteLearningNoteAPI(noteId, userPk);
      setNoteList((prev) => prev.filter((note) => note.id !== noteId));
      // If the deleted note belongs to the selected session, deselect
      if (selectedSession) {
        const deletedNote = noteList.find((n) => n.id === noteId);
        if (
          deletedNote &&
          deletedNote.session_id === selectedSession.session_id
        ) {
          setSelectedSession(null);
        }
      }
    } catch (e) {
      setError("Failed to delete note.");
    }
    setNoteLoading(false);
  };

  // Find note by session
  const getNoteBySession = (session_id) =>
    noteList.find((n) => n.session_id === session_id);

  // Improved session list UI
  const renderSessionList = () => (
    <ul className="space-y-1">
      {learningSessionList.length === 0 ? (
        <li className="text-gray-400 text-sm">No sessions found.</li>
      ) : (
        learningSessionList.map((session) => {
          const note = getNoteBySession(session.session_id);
          return (
            <li
              key={session.session_id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition ${
                selectedSession &&
                selectedSession.session_id === session.session_id
                  ? "bg-blue-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSessionSelect(session)}
            >
              <span className="truncate">{session.title || "Untitled"}</span>
              {note && (
                <button
                  className="ml-2"
                  title="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  <TrashIcon />
                </button>
              )}
            </li>
          );
        })
      )}
    </ul>
  );

  // Note content UI
  const renderNoteContent = () => {
    if (noteLoading) return <div>Loading note...</div>;
    if (creating) return <div>Creating note...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!selectedSession)
      return <div className="text-gray-400">Select a session.</div>;
    const note = getNoteBySession(selectedSession.session_id);
    if (!note)
      return (
        <div className="flex flex-col gap-4">
          <div className="text-gray-400">
            No note for this session.<br />
            Click the button below to create a note.
          </div>
          <button
            className="w-fit px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-blue-600 transition"
            onClick={handleCreateNote}
            disabled={creating}
          >
            Create Note
          </button>
        </div>
      );
    return (
      <div className="whitespace-pre-wrap border p-6 rounded bg-gray-50 min-h-[200px]">
        <div className="font-bold text-lg mb-2">{note.title}</div>
        <div>{note.content}</div>
        <div className="text-xs text-gray-400 mt-3">
          {new Date(note.created_at).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar />
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-10 select-none">Note</h2>
        <div className="flex flex-row gap-10 h-full">
          <div className="w-80 bg-gray-50 rounded-xl p-5 shadow-sm h-fit">
            <h3 className="font-bold mb-4 text-gray-700">Session List</h3>
            {loading ? <div>Loading...</div> : renderSessionList()}
            <div className="mt-4 text-xs text-gray-400">
              Select a session and click the create note button.
            </div>
          </div>
          <div className="flex-1">{renderNoteContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Note;
