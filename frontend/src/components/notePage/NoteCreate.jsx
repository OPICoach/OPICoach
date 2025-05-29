const NoteCreate = ({
  learningSessionList,
  learnSessionId,
  setLearnSessionId,
  newNoteTitle,
  setNewNoteTitle,
  creating,
  onCreateNote,
}) => (
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
export default NoteCreate;
