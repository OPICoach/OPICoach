import { useEffect, useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState } from "recoil";
import {
  learningSessionListState,
  learnSessionPkState,
} from "../atom/learnAtom";
import { userPkState } from "../atom/authAtoms";
import {
  getLearningSessionsAPI,
  postLearningNoteAPI,
  getLearningNotesAPI,
  deleteLearningNoteAPI,
} from "../api/api";
import { sideBarState } from "../atom/sidebarAtom";

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
    useRecoilState(learnSessionPkState);

  const [noteList, setNoteList] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [open] = useRecoilState(sideBarState);

  // 세션 목록 불러오기
  useEffect(() => {
    async function fetchSessions() {
      if (!userPk) return;
      setLoading(true);
      try {
        const res = await getLearningSessionsAPI(userPk);
        setLearningSessionList(res?.data?.sessions || []);
      } catch (e) {
        setLearningSessionList([]);
      }
      setLoading(false);
    }
    fetchSessions();
  }, [userPk, setLearningSessionList]);

  // 노트 목록 불러오기
  const fetchNotes = async () => {
    if (!userPk) return;
    setNoteLoading(true);
    try {
      const res = await getLearningNotesAPI(userPk);
      setNoteList(res?.data?.notes || []);
    } catch (e) {
      setNoteList([]);
    }
    setNoteLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [userPk]);

  // 세션 선택
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setError("");
  };

  // 노트 생성
  const handleCreateNote = async () => {
    if (!selectedSession || !userPk) return;
    setCreating(true);
    setError("");
    try {
      await postLearningNoteAPI({
        user_pk: userPk,
        session_pk: selectedSession.id,
        title: selectedSession.title || "Untitled",
      });
      await fetchNotes();
    } catch (e) {
      setError("노트 생성에 실패했습니다.");
    }
    setCreating(false);
  };

  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    if (!userPk) return;
    setNoteLoading(true);
    try {
      await deleteLearningNoteAPI(userPk, noteId);
      setNoteList((prev) => prev.filter((note) => note.id !== noteId));
      // 삭제된 노트가 선택된 세션의 노트라면 선택 해제
      if (selectedSession) {
        const deletedNote = noteList.find((n) => n.id === noteId);
        if (deletedNote && deletedNote.session_pk === selectedSession.id) {
          setSelectedSession(null);
        }
      }
    } catch (e) {
      setError("노트 삭제에 실패했습니다.");
    }
    setNoteLoading(false);
  };

  // 세션별 노트 찾기
  const getNoteBySession = (session_pk) =>
    noteList.find((n) => n.session_pk === session_pk);

  // 세션 리스트 UI
  const renderSessionList = () => (
    <ul className="space-y-1">
      {learningSessionList.length === 0 ? (
        <li className="text-gray-400 text-sm">세션이 없습니다.</li>
      ) : (
        learningSessionList.map((session) => {
          const note = getNoteBySession(session.id);
          return (
            <li
              key={session.id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition ${
                selectedSession && selectedSession.id === session.id
                  ? "bg-blue-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSessionSelect(session)}
            >
              <span className="truncate">{session.title || "Untitled"}</span>
              {note && (
                <button
                  className="ml-2"
                  title="노트 삭제"
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

  // 노트 내용 UI
  const renderNoteContent = () => {
    if (noteLoading) return <div>노트 불러오는 중...</div>;
    if (creating) return <div>노트 생성 중...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!selectedSession)
      return <div className="text-gray-400">세션을 선택하세요.</div>;
    const note = getNoteBySession(selectedSession.id);
    if (!note)
      return (
        <div className="flex flex-col gap-4">
          <div className="text-gray-400">
            이 세션에 대한 노트가 없습니다.
            <br />
            아래 버튼을 눌러 노트를 생성하세요.
          </div>
          <button
            className="w-fit px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-blue-600 transition"
            onClick={handleCreateNote}
            disabled={creating}
          >
            노트 생성
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
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-10 select-none">노트</h2>
        <div className="flex flex-row gap-10 h-full">
          <div className="w-80 bg-gray-50 rounded-xl p-5 shadow-sm h-fit">
            <h3 className="font-bold mb-4 text-gray-700">세션 목록</h3>
            {loading ? <div>불러오는 중...</div> : renderSessionList()}
            <div className="mt-4 text-xs text-gray-400">
              세션을 선택하고 노트 생성 버튼을 클릭하세요.
            </div>
          </div>
          <div className="flex-1">{renderNoteContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Note;
