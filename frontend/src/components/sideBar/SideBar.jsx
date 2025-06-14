import { useEffect } from "react";
import homeIcon from "../../assets/sidebar/home.svg";
import learnIcon from "../../assets/sidebar/learn.svg";
import testIcon from "../../assets/sidebar/test.svg";
import infoIcon from "../../assets/sidebar/infor.svg";
import logoutIcon from "../../assets/sidebar/log-out.svg";
import vocabIcon from "../../assets/sidebar/vocab.svg";
import noteIcon from "../../assets/sidebar/note.svg";
import historyIcon from "../../assets/sidebar/history.svg";
import sidebarLogo from "../../assets/sidebar/sidebarLogo.svg";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  messagesLearnState,
  learnSessionPkState,
  aiLoadingState,
  learningSessionListState,
} from "../../atom/learnAtom";
import {
  learnOpenState,
  sideBarState,
} from "../../atom/sidebarAtom";
import { userPkState, userInfoState } from "../../atom/authAtoms";
import {
  getLearningSessionAPI,
  patchLearningSessionAPI,
  getUserInfoAPI,
  getLearningSessionsAPI,
} from "../../api/api";
import SideBarLearnSection from "./SideBarLearnSection";

// 메뉴 목록
const menus = [
  { name: "Home", icon: homeIcon, path: "/" },
  { name: "Learn", icon: learnIcon, path: "/learn" },
  { name: "Note", icon: noteIcon, path: "/note" },
  { name: "Vocab/Idiom", icon: vocabIcon, path: "/vocab" },
  { name: "Test", icon: testIcon, path: "/test/info" },
  { name: "Test History", icon: historyIcon, path: "/test/history" },
];

// 유저 네임 앞자리
function getProfileInitial(userName) {
  if (!userName) return "";
  const parts = userName.trim().split(" ");
  if (parts.length > 1) {
    return parts[1][0] || parts[0][0];
  }
  return userName[0];
}

function getSafeSessionTitle(messages, sessionPk, serverTitle) {
  // 1. messages에서 첫 user 메시지
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

// 메시지 비교 함수
function isMessagesEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].role !== b[i].role || a[i].content !== b[i].content) return false;
  }
  return true;
}

const SideBar = () => {
  const [open, setOpen] = useRecoilState(sideBarState);
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPk] = useRecoilState(userPkState);
  const [learnSessionPk, setLearnSessionPk] =
    useRecoilState(learnSessionPkState);
  const resetLearnOpen = useResetRecoilState(learnOpenState);
  const [messages] = useRecoilState(messagesLearnState);
  const [isAILoading, setIsAILoading] = useRecoilState(aiLoadingState);
  const [learningSessionList, setLearningSessionList] = useRecoilState(
    learningSessionListState
  );

  const navigate = useNavigate();
  const location = useLocation();

  const initial = userData?.name ? getProfileInitial(userData.name) : "";

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      setUserPk(null);
      setUserData(null);
      setLearnSessionPk(null);

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userPk");
      localStorage.removeItem("sessionPk");
      navigate("/login");
    }
  };

  const handleTabMove = async (menu) => {
    if (isAILoading) return;
    navigate(menu.path);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (userPk) {
          const response = await getUserInfoAPI(userPk);
          setUserData(response);
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      }
    };
    fetchUserInfo();
  }, [userPk, setUserData]);

  useEffect(() => {
    const fetchSessionList = async () => {
      try {
        if (userPk) {
          const res = await getLearningSessionsAPI(userPk);
          setLearningSessionList(res.data?.sessions || []);
        } else {
          setLearningSessionList([]); // userPk 없으면 목록 비움
        }
      } catch (error) {
        console.error("세션 목록을 불러오는데 실패했습니다:", error);
        setLearningSessionList([]);
      }
    };
    fetchSessionList();
  }, [userPk, setLearningSessionList]);

  return (
    <>
      <button
        className={
          "fixed top-1 left-3 z-40 bg-white rounded-full shadow p-3 w-10 h-10 flex items-center justify-center select-none " +
          (open ? "md:hidden" : "")
        }
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
      >
        {open ? (
          <span className="text-xl">{"\u2190"}</span>
        ) : (
          <span className="text-xl">&#9776;</span>
        )}
      </button>

      <aside
        className={`fixed top-0 left-0 flex flex-col h-dvh bg-neutral z-30 transition-all duration-300
          ${open ? "min-w-[230px] w-[230px]" : "min-w-0 w-0 overflow-hidden"}
          ${open ? "shadow-lg" : ""}
          `}
      >
        <div className="flex items-center justify-center h-24 cursor-pointer">
          <img
            src={sidebarLogo}
            alt="OPICoach Logo"
            className="h-10"
            onClick={() => navigate("/")}
          />
        </div>
        <nav className="flex-1 mt-10 mx-1">
          {menus.map((menu) => {
            const isActive =
              menu.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(menu.path);
            if (menu.name === "Learn") {
              return (
                <SideBarLearnSection
                  key={menu.name}
                  menu={menu}
                  isActive={isActive}
                />
              );
            }
            return (
              <div key={menu.name}>
                <button
                  onClick={async () => {
                    resetLearnOpen();

                    await handleTabMove(menu, learnSessionPk);
                  }}
                  className={
                    "flex items-center w-full my-[10px] px-5 py-3 text-accent border-[#E5E7EB] rounded-lg transition cursor-pointer " +
                    (isActive ? "bg-white font-semibold" : "hover:bg-white") +
                    (isAILoading
                      ? " opacity-50 cursor-not-allowed pointer-events-none"
                      : " cursor-pointer")
                  }
                  style={{ outline: "none", border: "none" }}
                >
                  <img
                    src={menu.icon}
                    alt={menu.name}
                    className="w-6 h-6 mr-[19px]"
                  />
                  <span>{menu.name}</span>
                </button>
              </div>
            );
          })}
        </nav>
        <div className="flex items-center px-5 pb-6 select-none">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">{initial}</span>
          </div>
          <span className="text-black font-medium">{userData?.name}</span>
          <button
            className="ml-auto hover:bg-gray-100 rounded-full"
            title="로그아웃"
            onClick={handleLogout}
          >
            <img src={logoutIcon} alt="로그아웃" className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
