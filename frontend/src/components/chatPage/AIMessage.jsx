import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const AIMessage = ({ message }) => {
  const processedMessage = message.replace(/<br\s*\/?>/g, "\n\n");

  return (
    <div className="self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-base leading-relaxed" {...props} />
            ),
          }}
        >
          {processedMessage}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AIMessage;
