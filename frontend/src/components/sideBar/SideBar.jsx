import { useState, useEffect } from "react";
import homeIcon from "../../assets/sidebar/home.svg";
import learnIcon from "../../assets/sidebar/learn.svg";
import testIcon from "../../assets/sidebar/test.svg";
import infoIcon from "../../assets/sidebar/infor.svg";
import logoutIcon from "../../assets/sidebar/log-out.svg";
import sidebarLogo from "../../assets/sidebar/sidebarLogo.svg";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { useRecoilState, useResetRecoilState } from "recoil";
import { messagesLearnState, learnSessionIdState } from "../../atom/learnAtom";
import {
  learnOpenState,
  loadingSessionsState,
  sideBarState,
} from "../../atom/sidebarAtom";
import { userPkState, userInfoState } from "../../atom/authAtoms";
import {
  postLearningSessionAPI,
  endLearningSessionAPI,
  getLearningSessionAPI,
  getUserInfoAPI,
} from "../../api/api";

import SideBarLearnSection from "./SideBarLearnSection";

const menus = [
  { name: "Home", icon: homeIcon, path: "/" },
  { name: "Learn", icon: learnIcon, path: "/learn" },
  { name: "Test", icon: testIcon, path: "/test" },
  { name: "Note", icon: infoIcon, path: "/note" },
];

// 유저 네임 앞자리 가져오기
function getProfileInitial(userName) {
  if (!userName) return "";

  // 영문 이름인 경우 (예: Gildong Hong)
  const parts = userName.trim().split(" ");
  if (parts.length > 1) {
    return parts[1][0] || parts[0][0];
  }
  return userName[0];
}

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
  const [learnSessionId, setLearnSessionId] =
    useRecoilState(learnSessionIdState);
  const resetLearnOpen = useResetRecoilState(learnOpenState);
  const [messages] = useRecoilState(messagesLearnState);

  const navigate = useNavigate();
  const location = useLocation();

  // userData가 있을 때만 initial을 계산
  const initial = userData?.name ? getProfileInitial(userData.name) : "";

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // 로그인 상태 및 유저 정보 모두 초기화
      setUserPk(null); // userPk 리코일 atom 초기화
      setUserData(null); // userInfoState 리코일 atom 초기화
      localStorage.removeItem("isLoggedIn"); // 로그인 상태 로컬스토리지 제거
      localStorage.removeItem("userPk"); // userPk 로컬스토리지 제거(리코일 effect에서 자동으로 처리되지만 명시적으로)
      navigate("/login");
    }
  };

  const handleTabMove = async (menu, currentSessionId) => {
    // Learn 이외 탭 이동 시
    if (menu.name !== "Learn" && currentSessionId) {
      try {
        const sessionData = await getLearningSessionAPI(
          userPk,
          currentSessionId
        );
        const serverMessages = sessionData.messages || [];
        if (!isMessagesEqual(messages, serverMessages)) {
          await endLearningSessionAPI({
            user_pk: userPk,
            session_id: currentSessionId,
          });
        }
        setLearnSessionId("");
      } catch (e) {
        setLearnSessionId("");
      }
    }
    navigate(menu.path);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (userPk) {
          const response = await getUserInfoAPI(userPk);
          console.log("사용자 정보:", response); // 디버깅을 위한 로그
          setUserData(response);
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      }
    };

    fetchUserInfo();
  }, [userPk, setUserData]);

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

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 flex flex-col h-dvh bg-neutral z-30 transition-all duration-300
          ${open ? "min-w-[230px] w-[230px]" : "min-w-0 w-0 overflow-hidden"}
          ${open ? "shadow-lg" : ""}
          `}
        style={{}}
      >
        {/* 로고 */}
        <div className="flex items-center justify-center h-24 cursor-pointer">
          <img
            src={sidebarLogo}
            alt="OPICoach Logo"
            className="h-10"
            onClick={() => navigate("/")}
          />
        </div>
        {/* 메뉴 */}
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
                  learnSessionId={learnSessionId}
                />
              );
            }
            // 나머지 메뉴는 기존 방식 그대로
            return (
              <div key={menu.name}>
                <button
                  onClick={async () => {
                    // Learn 토글 닫기
                    resetLearnOpen();
                    // 기존 탭 이동/세션 종료 로직
                    const match = matchPath(
                      "/learn/session/:session_id",
                      location.pathname
                    );
                    const currentSessionId = match
                      ? match.params.session_id
                      : learnSessionId;
                    await handleTabMove(menu, currentSessionId);
                  }}
                  className={
                    "flex items-center w-full my-[10px] px-5 py-3 text-accent border-[#E5E7EB] rounded-lg transition cursor-pointer " +
                    (isActive ? "bg-white font-semibold" : "hover:bg-white")
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
        {/* 프로필 */}
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
