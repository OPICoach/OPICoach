import { useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  learningSessionListState,
  messagesLearnState,
  learnSessionIdState,
} from "../../atom/learnAtom";

import { learnOpenState, loadingSessionsState } from "../../atom/sidebarAtom";

import {
  getLearningSessionsAPI,
  getLearningSessionAPI,
  postLearningSessionAPI,
} from "../../api/api";
import { userPkState } from "../../atom/authAtoms";
import { useNavigate, useParams } from "react-router-dom";

import useRandomSessionId from "../../hooks/useRandomSessionId";

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

const SideBarLearnSection = ({ menu, isActive, learnSessionId }) => {
  const [learnOpen, setLearnOpen] = useRecoilState(learnOpenState);
  const [learningSessionList, setLearningSessionList] = useRecoilState(
    learningSessionListState
  );
  const [loadingSessions, setLoadingSessions] =
    useRecoilState(loadingSessionsState);
  const [userPk] = useRecoilState(userPkState);
  const [, setMessages] = useRecoilState(messagesLearnState);
  const [, setLearnSessionId] = useRecoilState(learnSessionIdState);
  const navigate = useNavigate();
  const { session_id } = useParams();
  const getRandomSessionId = useRandomSessionId();

  // 세션 목록 불러오기 + 없으면 새 세션 생성
  const fetchSessions = async () => {
    if (!userPk) return;
    setLoadingSessions(true);
    try {
      const data = await getLearningSessionsAPI(userPk);
      setLearningSessionList(data || []);
      // 세션 목록을 받아온 후, 세션이 없을 때만 새 세션 생성
      if (!data || data.length === 0) {
        await createNewSession();
      }
    } catch (e) {
      setLearningSessionList([]);
      await createNewSession(); // 에러로 세션 목록을 못 받아올 때도 새 세션 생성
    }
    setLoadingSessions(false);
  };

  // Learn 탭 토글 시 세션 목록 불러오기
  const handleLearnToggle = async () => {
    setLearnOpen((prev) => !prev);
    if (!learnOpen) {
      await fetchSessions();
    }
  };

  // 세션 클릭 시 learnSessionId도 업데이트
  const handleSessionClick = (session) => {
    setLearnSessionId(session.session_id); // 현재 세션 id 업데이트
    navigate(`/learn/session/${session.session_id}`);
  };

  // 세션 생성 함수 추가
  const createNewSession = async () => {
    if (!userPk) return;
    let title = "제일 처음일 때";
    const randomSessionId = getRandomSessionId();
    try {
      const newSession = await postLearningSessionAPI(
        userPk,
        randomSessionId,
        title
      );
      if (newSession) {
        setLearningSessionList((prev) => [...prev, newSession]);
        setLearnSessionId(newSession.session_id);
        navigate(`/learn/session/${newSession.session_id}`);
      }
    } catch (e) {
      // 에러 처리 (예: 알림)
    }
  };

  useEffect(() => {
    if (learnOpen && learningSessionList.length > 0) {
      const first = learningSessionList[0];
      if (first && learnSessionId !== first.session_id) {
        handleSessionClick(first);
      }
    }
  }, [learnOpen, learningSessionList]);

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
          {learnOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>
      {learnOpen && (
        <div
          className="ml-8 mt-2"
          style={{
            maxHeight: "210px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {loadingSessions ? (
            <div>로딩 중...</div>
          ) : learningSessionList.length === 0 ? (
            <div className="text-gray-400 text-sm">저장된 세션이 없습니다.</div>
          ) : (
            <ul>
              {learningSessionList.map((session) => (
                <li
                  key={session.session_id}
                  className={`py-2 px-2 rounded cursor-pointer transition 
                    ${
                      learnSessionId === session.session_id
                        ? "bg-blue-100 font-bold"
                        : ""
                    }`}
                  onClick={() => handleSessionClick(session)}
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {session.title || "제목 없음"}
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
