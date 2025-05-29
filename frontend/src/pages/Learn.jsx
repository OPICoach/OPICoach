import { useState } from "react";
import {
  postLearningResponseAPI,
  postLearningSessionAPI,
  getLearningSessionsAPI,
  patchLearningSessionAPI,
} from "../api/api.js";
import SideBar from "../components/sideBar/SideBar.jsx";
import MessageInput from "../components/chatPage/MessageInput.jsx";
import MessageList from "../components/chatPage/MessageList.jsx";
import { useRecoilState } from "recoil";
import { userPkState } from "../atom/authAtoms.js";
import {
  messagesLearnState,
  learnSessionPkState,
  learnSessionState,
  learningSessionListState,
  aiLoadingState,
} from "../atom/learnAtom.js";
import { sideBarState, loadingSessionsState } from "../atom/sidebarAtom.js";
import { useNavigate } from "react-router-dom";

function getSafeSessionTitle(messages, sessionPk) {
  // 1. messages에서 첫 user 메시지 content 앞 10글자
  const userMsg = messages?.find?.(
    (m) =>
      m.role === "user" &&
      typeof m.content === "string" &&
      m.content.trim() !== ""
  );
  if (userMsg) {
    const firstLine = userMsg.content.split("\n")[0];
    if (firstLine) return firstLine;
  }

  // 3. fallback: 세션 PK 기반
  return `Session_${sessionPk ?? "Unknown"}`;
}

const Learn = () => {
  const [input, setInput] = useState("");
  const [isAILoading, setIsAILoading] = useRecoilState(aiLoadingState);
  const [sessionPk, setSessionPk] = useRecoilState(learnSessionPkState);
  const [open, setOpen] = useRecoilState(sideBarState);
  const [userPk] = useRecoilState(userPkState);
  const [messages, setMessages] = useRecoilState(messagesLearnState);
  const navigate = useNavigate();

  const handleNewSession = async () => {
    try {
      let title = getSafeSessionTitle(messages, sessionPk);
      await patchLearningSessionAPI(userPk, sessionPk, title);

      const newSession = await postLearningSessionAPI(
        userPk,
        `Session_${(sessionPk ?? 0) + 1}`
      );
      setSessionPk(newSession.session_pk);
      setMessages([]);

      navigate(`/learn/session/${newSession.session_pk}`);
    } catch (e) {
      alert("새 세션 생성에 실패했습니다.");
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    // 1. 사용자 메시지 먼저 화면에 표시
    const newUserMessage = { role: "user", content: input };
    setMessages((prev) => [
      ...prev,
      newUserMessage,
      { role: "assistant", content: "loading...", isLoading: true },
    ]);
    setInput("");
    setIsAILoading(true);

    try {
      // 2. AI 응답 받아서 마지막 메시지 교체
      const response = await postLearningResponseAPI({
        user_pk: userPk,
        session_pk: sessionPk,
        question: input,
      });

      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.isLoading) {
          return [
            ...prev.slice(0, lastIndex),
            { role: "assistant", content: response.answer },
          ];
        }
        return [...prev, { role: "assistant", content: response.answer }];
      });
    } catch (error) {
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.isLoading) {
          return [
            ...prev.slice(0, lastIndex),
            { role: "assistant", content: "서버와의 통신에 실패했습니다." },
          ];
        }
        return [
          ...prev,
          { role: "assistant", content: "서버와의 통신에 실패했습니다." },
        ];
      });
    } finally {
      setIsAILoading(false);
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
