import TrashIcon from "./TrashIcon.jsx";

const NoteDetail = ({ noteDetail, onDeleteNote }) => (
  <div className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto relative">
    <h3 className="font-semibold mb-4 flex justify-between items-center">
      <span>Note Detail</span>
      {noteDetail && (
        <TrashIcon
          className="cursor-pointer"
          onClick={() => {
            onDeleteNote(noteDetail.id || noteDetail.note_pk);
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
);
export default NoteDetail;
