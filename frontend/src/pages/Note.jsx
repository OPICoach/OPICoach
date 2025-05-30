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
import NoteCreate from "../components/notePage/NoteCreate.jsx";
import NoteList from "../components/notePage/NoteList.jsx";
import NoteDetail from "../components/notePage/NoteDetail.jsx";

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

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await getLearningNotesAPI(userPk, 0);
      if (res.success) {
        const notes = Array.isArray(res.data.notes) ? res.data.notes : [];
        setNoteList(notes);
      } else {
        alert("Failed to load notes.");
      }
    } catch (error) {
      console.error(error);
      alert("Error loading notes.");
    }
    setLoadingNotes(false);
  };

  const handleCreateNote = async () => {
    if (!learnSessionId) {
      alert("Please select a session.");
      return;
    }
    if (!newNoteTitle.trim()) {
      alert("Please enter a note title.");
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
        fetchNotes();
      } else {
        alert("Failed to create note.");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating note.");
    }
    setCreating(false);
  };

  const handleDeleteNote = async (note_pk) => {
    if (!window.confirm("노트를 정말 삭제하시겠습니까?")) return;
    try {
      const res = await deleteLearningNoteAPI(userPk, note_pk);
      if (res.success) {
        alert("노트가 삭제되었습니다.");
        if (currentNotePk === note_pk) {
          setNoteDetail(null);
          setCurrentNotePk(0);
        }
        fetchNotes();
      } else {
        alert("노트 삭제를 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting note.");
    }
  };

  const handleSelectNote = async (note_pk) => {
    try {
      const res = await getLearningNotesAPI(userPk, note_pk);
      if (res.success) {
        const note = Array.isArray(res.data.notes)
          ? res.data.notes[0]
          : res.data;
        setNoteDetail(note);
        setCurrentNotePk(note_pk);
      } else {
        alert("Failed to load note details.");
      }
    } catch (error) {
      console.error(error);
      alert("Error loading note details.");
    }
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
        <h2 className="text-2xl font-semibold mb-6 select-none">Note</h2>

        <NoteCreate
          newNoteTitle={newNoteTitle}
          setNewNoteTitle={setNewNoteTitle}
          onCreateNote={handleCreateNote}
        />

        <div className="flex flex-1 overflow-hidden space-x-6">
          <div className="w-1/4 border border-gray-200 rounded-lg p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">All Notes</h3>
            <NoteList
              onSelectNote={handleSelectNote}
              loadingNotes={loadingNotes}
            />
          </div>

          <NoteDetail noteDetail={noteDetail} onDeleteNote={handleDeleteNote} />
        </div>
      </div>
    </div>
  );
};

export default Note;
