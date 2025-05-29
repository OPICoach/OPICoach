import { useRecoilState } from "recoil";
import {
  postLearningSessionAPI,
  getLearningSessionsAPI,
  getLearningSessionAPI,
  patchLearningSessionAPI,
  deleteLearningSessionAPI,
} from "../../api/api";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  learningSessionListState,
  learnSessionPkState,
  messagesLearnState,
  aiLoadingState,
} from "../../atom/learnAtom";
import { userPkState } from "../../atom/authAtoms";
import { learnOpenState } from "../../atom/sidebarAtom";

const ChevronDownIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);

function getSafeSessionTitle(messages, sessionPk, serverTitle) {
  // 1. messages에서 첫 user 메시지 content
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
  // 2. 서버 title이 있으면 사용
  if (
    serverTitle &&
    typeof serverTitle === "string" &&
    serverTitle.trim() !== ""
  ) {
    return serverTitle.trim();
  }
  // 3. fallback: 세션 PK 기반
  return `Session_${sessionPk ?? "Unknown"}`;
}

const SideBarLearnSection = ({ menu, isActive }) => {
  const [open, setOpen] = useRecoilState(learnOpenState);
  const [learningSessionList, setLearningSessionList] = useRecoilState(
    learningSessionListState
  );
  const [userPk] = useRecoilState(userPkState);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useRecoilState(messagesLearnState);
  const [sessionPk, setSessionPk] = useRecoilState(learnSessionPkState);
  const navigate = useNavigate();
  const [isAILoading, setIsAILoading] = useRecoilState(aiLoadingState);

  // 이전 isActive 추적
  const prevIsActiveRef = useRef(isActive);

  // isActive가 false→true로 바뀔 때만 open을 true로
  useEffect(() => {
    if (!prevIsActiveRef.current && isActive) {
      setOpen(true);
    }
    prevIsActiveRef.current = isActive;
  }, [isActive]);

  // 이전 세션/메시지 추적용 ref
  const prevSessionPkRef = useRef();
  const prevMessagesRef = useRef();

  // messages가 변경될 때마다 ref에 저장
  useEffect(() => {
    prevMessagesRef.current = messages;
  }, [messages]);

  // sessionPk가 변경될 때마다 ref에 저장
  useEffect(() => {
    prevSessionPkRef.current = sessionPk;
  }, [sessionPk]);

  const patchPrevSessionIfNeeded = async () => {
    const prevPk = prevSessionPkRef.current;
    const prevMsgs = prevMessagesRef.current;

    try {
      const res = await getLearningSessionAPI(userPk, prevPk);
      const serverTitle = res.data?.title;
      await patchLearningSessionAPI(userPk, prevPk, serverTitle);
    } catch (e) {
      // 실패 시 무시 또는 로깅
    }
  };

  // Learn 탭 토글
  const handleLearnToggle = async () => {
    if (isAILoading) return; // AI 로딩 중이면 무시

    if (!open) {
      setLoading(true);
      // 탭 전환 전 patch
      await patchPrevSessionIfNeeded();
      try {
        // 세션 목록 불러오기
        const res = await getLearningSessionsAPI(userPk);
        const sessions = res.data?.sessions || [];
        setLearningSessionList(sessions);

        if (sessions.length > 0) {
          setSessionPk(sessions[0].id);
          // 세션 대화 불러오기
          const sessionRes = await getLearningSessionAPI(
            userPk,
            sessions[0].id
          );
          setMessages(sessionRes.data?.chat_history || []);
          navigate(`/learn/session/${sessions[0].id}`);
        } else {
          // 세션 없으면 새로 생성
          const uniqueTitle = `New Session_${Date.now()}`;
          const newSession = await postLearningSessionAPI(userPk, uniqueTitle);
          const res2 = await getLearningSessionsAPI(userPk);
          const newSessions = res2.data?.sessions || [];
          setLearningSessionList(newSessions);

          setSessionPk(newSession.session_pk);
          setMessages([]);
          if (newSession && newSession.session_pk) {
            navigate(`/learn/session/${newSession.session_pk}`);
          } else if (newSessions.length > 0) {
            navigate(`/learn/session/${newSessions[0].id}`);
          }
        }
      } catch (e) {
        alert("세션 처리 실패");
      }
      setLoading(false);
    }
    setOpen((prev) => !prev);
  };

  // 세션 클릭 시 이전 세션 patch 후 이동
  const handleSessionClick = async (session) => {
    if (isAILoading) return; // AI 로딩 중이면 무시

    if (sessionPk !== session.id) {
      await patchPrevSessionIfNeeded();
    }
    setSessionPk(session.id);
    try {
      const res = await getLearningSessionAPI(userPk, session.id);
      setMessages(res.data?.chat_history || []);
      navigate(`/learn/session/${session.id}`);
    } catch (e) {
      setMessages([]);
      alert("세션 대화 내용을 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    // sessionPk가 변경될 때마다 세션 목록 갱신
    const fetchSessions = async () => {
      try {
        const res = await getLearningSessionsAPI(userPk);
        const sessions = res.data?.sessions || [];
        setLearningSessionList(sessions);
      } catch (error) {
        console.error("세션 목록을 불러오는데 실패했습니다.", error);
      }
    };

    if (sessionPk) {
      fetchSessions();
    }
  }, [sessionPk, setLearningSessionList, userPk]);

  return (
    <div>
      <button
        onClick={handleLearnToggle}
        className={
          "flex items-center w-full my-[10px] px-5 py-3 text-accent border-[#E5E7EB] rounded-lg transition cursor-pointer " +
          (isActive ? "bg-white font-semibold" : "hover:bg-white")
        }
        style={{ outline: "none", border: "none", position: "relative" }}
      >
        <img src={menu.icon} alt={menu.name} className="w-6 h-6 mr-[19px]" />
        <span>{menu.name}</span>
        <span className="ml-auto flex items-center">
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>
      {open && (
        <div
          className="ml-8 mt-2"
          style={{
            maxHeight: "210px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {loading ? (
            <div>로딩 중...</div>
          ) : learningSessionList.length === 0 ? (
            <div className="text-gray-400 text-sm">저장된 세션이 없습니다.</div>
          ) : (
            <ul>
              {learningSessionList.map((session, idx) => (
                <li
                  key={session.id ?? `temp-session-${idx}`}
                  className={
                    "py-2 px-2 rounded cursor-pointer transition " +
                    (sessionPk === session.id ? "bg-blue-100 font-bold" : "") +
                    (isAILoading ? " opacity-50 cursor-not-allowed" : "")
                  }
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  onClick={() => handleSessionClick(session)}
                >
                  {session.title && session.title.trim() !== ""
                    ? session.title
                    : "null"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SideBarLearnSection;
