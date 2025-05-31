import TrashIcon from "./TrashIcon.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-base leading-relaxed" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold" {...props} />
            ),
          }}
        >
          {noteDetail.content || "No content available."}
        </ReactMarkdown>
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
