import { useEffect, useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import { useRecoilState } from "recoil";
import {
  learningSessionListState,
  learnSessionPkState,
  aiLoadingState,
} from "../atom/learnAtom";
import { userPkState } from "../atom/authAtoms";
import {
  postLearningNoteAPI,
  getLearningNotesAPI,
  deleteLearningNoteAPI,
} from "../api/api";
import { sideBarState } from "../atom/sidebarAtom";
import { noteListState, notePkState } from "../atom/noteAtom";

const TrashIcon = ({ className, onClick }) => (
  <svg
    onClick={onClick}
    className={`w-5 h-5 text-gray-400 hover:text-red-500 transition ${className}`}
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
  const [learningSessionList] = useRecoilState(learningSessionListState);
  const [learnSessionId, setLearnSessionId] =
    useRecoilState(learnSessionPkState);

  const [noteList, setNoteList] = useRecoilState(noteListState);
  const [currentNotePk, setCurrentNotePk] = useRecoilState(notePkState);
  const [creating, setCreating] = useRecoilState(aiLoadingState);
  const [open] = useRecoilState(sideBarState);

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [noteDetail, setNoteDetail] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // 컴포넌트 마운트 시 전체 노트 목록 조회
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await getLearningNotesAPI(userPk, 0); // 0: 전체 노트 조회
      if (res.success) {
        // res.data.notes가 실제 노트 배열임
        const notes = Array.isArray(res.data.notes) ? res.data.notes : [];
        console.log("노트 목록:", notes);
        setNoteList(notes);
      } else {
        alert("노트 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("노트 목록 불러오기 중 오류가 발생했습니다.");
    }
    setLoadingNotes(false);
  };

  // 노트 생성 함수 (세션 선택은 필수)
  const handleCreateNote = async () => {
    if (!learnSessionId) {
      alert("노트를 생성할 세션을 선택해주세요.");
      return;
    }
    if (!newNoteTitle.trim()) {
      alert("노트 제목을 입력해주세요.");
      return;
    }
    setCreating(true);
    try {
      const res = await postLearningNoteAPI({
        user_pk: userPk,
        session_pk: learnSessionId,
        title: newNoteTitle.trim(),
      });
      if (res.success) {
        setNewNoteTitle("");
        setNoteDetail(res.data);
        fetchNotes(); // 생성 후 전체 노트 목록 갱신
      } else {
        alert("노트 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("노트 생성 중 오류가 발생했습니다.");
    }
    setCreating(false);
  };

  // 노트 삭제 함수
  const handleDeleteNote = async (note_pk) => {
    if (!window.confirm("정말 이 노트를 삭제하시겠습니까?")) return;
    try {
      const res = await deleteLearningNoteAPI(userPk, note_pk);
      if (res.success) {
        alert("노트가 삭제되었습니다.");
        if (currentNotePk === note_pk) {
          setNoteDetail(null);
        }
        fetchNotes();
      } else {
        alert("노트 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("노트 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSelectNote = async (note_pk) => {
    try {
      const res = await getLearningNotesAPI(userPk, note_pk);
      if (res.success) {
        // 상세도 notes 배열로 오는 경우
        const note = Array.isArray(res.data.notes)
          ? res.data.notes[0]
          : res.data;
        setNoteDetail(note);
        setCurrentNotePk(note_pk);
      } else {
        alert("노트 상세 조회에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("노트 상세 조회 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-row h-screen bg-white">
      {/* 사이드바 */}
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-6 select-none">Note</h2>

        {/* 노트 생성 영역 (세션 선택은 노트 생성 시에만 사용) */}
        <div className="flex items-center mb-6 space-x-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={learnSessionId || ""}
            onChange={(e) => setLearnSessionId(Number(e.target.value))}
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

          <input
            type="text"
            placeholder="Enter new note title"
            className="border border-gray-300 rounded-lg px-3 py-2 flex-grow"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateNote();
              }
            }}
            disabled={creating}
          />

          <button
            className={`bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50`}
            onClick={handleCreateNote}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden space-x-6">
          {/* 전체 노트 목록 */}
          <div className="w-1/4 border border-gray-200 rounded-lg p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">All Notes</h3>
            {loadingNotes ? (
              <p>Loading notes...</p>
            ) : noteList.length === 0 ? (
              <p>No notes available.</p>
            ) : (
              <ul>
                {noteList.map((note) => (
                  <li
                    key={note.id}
                    className={`flex justify-between items-center mb-2 p-2 rounded-lg cursor-pointer ${
                      currentNotePk === note.id
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectNote(note.id)}
                  >
                    <span>{note.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 노트 상세 내용 */}
          <div className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto relative">
            <h3 className="font-semibold mb-4 flex justify-between items-center">
              <span>Note Detail</span>
              {noteDetail && (
                <TrashIcon
                  className="cursor-pointer"
                  onClick={() => {
                    if (window.confirm("노트를 정말 삭제하시겠습니까?")) {
                      handleDeleteNote(noteDetail.id || noteDetail.note_pk);
                    }
                  }}
                />
              )}
            </h3>
            {noteDetail ? (
              <div>
                <h4 className="text-xl font-bold mb-2">{noteDetail.title}</h4>
                <p className="whitespace-pre-wrap">
                  {noteDetail.content || "No content available."}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Created At: {new Date(noteDetail.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p>Select a note to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;
