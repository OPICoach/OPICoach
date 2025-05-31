import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const AIMessage = ({ message }) => (
  <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
    <div className="prose">
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
        {message}
      </ReactMarkdown>
    </div>
  </div>
);

export default AIMessage;
