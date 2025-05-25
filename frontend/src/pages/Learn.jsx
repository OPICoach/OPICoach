import { useRecoilState } from "recoil";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  postLearningResponseAPI,
  postLearningSessionAPI,
  endLearningSessionAPI,
} from "../api/api.js";
import { userPkState } from "../api/authAtoms.js";
import SideBar from "../components/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import { messagesLearnState, learnSessionIdState } from "../api/atom.js";
import useRandomSessionId from "../hooks/useRandomSessionId";

function getTitleFromMessage(message) {
  // 첫 줄만 추출
  const firstLine = message.includes("\n")
    ? message.slice(0, message.indexOf("\n"))
    : message;
  // 첫 줄에서 10글자만 추출
  return firstLine.slice(0, 10);
}

const Learn = () => {
  const [user_pk] = useRecoilState(userPkState);
  const [messages, setMessages] = useRecoilState(messagesLearnState);
  const [input, setInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [learnSessionId, setLearnSessionId] =
    useRecoilState(learnSessionIdState);
  const navigate = useNavigate();
  const { session_id } = useParams();
  const getRandomSessionId = useRandomSessionId();

  useEffect(() => {
    if (session_id) setLearnSessionId(session_id);
  }, [session_id, setLearnSessionId]);

  // + 버튼 클릭 시 새로운 세션 생성 및 이동
  const handleNewSession = async () => {
    // 현재 세션 종료
    if (learnSessionId) {
      try {
        await endLearningSessionAPI({ user_pk, session_id: learnSessionId });
      } catch (e) {
        console.error("세션 종료 실패", e);
      }
    }
    // title: 첫 메시지의 맨 앞 줄 10글자 (없으면 "New Session")
    let title = "New Session";
    if (messages.length > 0 && messages[0].role === "user") {
      title = getTitleFromMessage(messages[0].content) || "New Session";
    }
    // 새 세션 생성
    const randomSessionId = getRandomSessionId();
    try {
      await postLearningSessionAPI(user_pk, randomSessionId, title);
      setLearnSessionId(randomSessionId);
      setMessages([]);
      navigate(`/learn/session/${randomSessionId}`);
    } catch (e) {
      alert("새 세션 생성에 실패했습니다.");
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const newUserMessage = { role: "user", content: input };
    setMessages((prev) => [
      ...prev,
      newUserMessage,
      { role: "ai", content: "loading...", isLoading: true },
    ]);
    setInput("");
    setIsAILoading(true);

    try {
      const response = await postLearningResponseAPI({
        user_pk,
        session_id: session_id,
        question: input,
      });

      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.isLoading) {
          return [
            ...prev.slice(0, lastIndex),
            { role: "ai", content: response.answer },
          ];
        }
        return [...prev, { role: "ai", content: response.answer }];
      });
    } catch (error) {
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.isLoading) {
          return [
            ...prev.slice(0, lastIndex),
            { role: "ai", content: "서버와의 통신에 실패했습니다." },
          ];
        }
        return [
          ...prev,
          { role: "ai", content: "서버와의 통신에 실패했습니다." },
        ];
      });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-white">
      <SideBar />
      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-semibold select-none">Learn</h2>
          <button
            onClick={handleNewSession}
            className="px-1 py-1 text-xl rounded-full bg-primary text-white hover:bg-blue-600 transition"
            title="새 세션 만들기"
            style={{ minWidth: 32, minHeight: 32, lineHeight: "1.1" }}
          >
            +
          </button>
        </div>
        <MessageList messages={messages} />
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={handleSend}
          isAILoading={isAILoading}
        />
      </div>
    </div>
  );
};

export default Learn;
