import { useState, useEffect } from "react";
import homeIcon from "../assets/sidebar/home.svg";
import learnIcon from "../assets/sidebar/learn.svg";
import testIcon from "../assets/sidebar/test.svg";
import infoIcon from "../assets/sidebar/infor.svg";
import settingIcon from "../assets/sidebar/setting.svg";
import sidebarLogo from "../assets/sidebar/sidebarLogo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sideBarState, userInfoState } from "../api/atom";
import { getUserInfoAPI } from "../api/api";
import { userPkState } from "../api/authAtoms";

const menus = [
  { name: "Home", icon: homeIcon, path: "/" },
  { name: "Learn", icon: learnIcon, path: "/learn" },
  { name: "Test", icon: testIcon, path: "/test" },
  { name: "Information", icon: infoIcon, path: "/information" },
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

const SideBar = () => {
  const [open, setOpen] = useRecoilState(sideBarState);
  const [userData, setUserData] = useRecoilState(userInfoState);
  const [userPk, setUserPk] = useRecoilState(userPkState);
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
      // 필요하다면 추가로 관련 상태도 초기화
      navigate("/login");
    }
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
        className={`sticky top-0 left-0 flex flex-col h-dvh bg-neutral z-30 transition-all duration-300
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
            return (
              <button
                key={menu.name}
                onClick={() => {
                  navigate(menu.path);
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
            );
          })}
        </nav>
        {/* 프로필 */}
        <div className="flex items-center px-5 pb-6 cursor-default">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">{initial}</span>
          </div>
          <span className="text-black font-medium">{userData?.name}</span>
          <button
            className="ml-auto hover:bg-gray-100 rounded-full"
            title="로그아웃"
            onClick={handleLogout}
          >
            <img src={settingIcon} alt="로그아웃" className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
