import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const AIMessage = ({ message }) => (
  <div className="prose self-start bg-gray-200 p-4 rounded-xl max-w-[60%]">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {message}
    </ReactMarkdown>
  </div>
);

export default AIMessage;
