const NoteList = ({ noteList, currentNotePk, onSelectNote, loadingNotes }) => {
  if (loadingNotes) return <p>Loading notes...</p>;
  if (noteList.length === 0) return <p>No notes available.</p>;

  return (
    <ul>
      {noteList.map((note) => (
        <li
          key={note.id}
          className={`flex justify-between items-center mb-2 p-2 rounded-lg cursor-pointer ${
            currentNotePk === note.id
              ? "bg-blue-100 font-semibold"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onSelectNote(note.id)}
        >
          <span>{note.title}</span>
        </li>
      ))}
    </ul>
  );
};
export default NoteList;
