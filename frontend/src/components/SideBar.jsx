import homeIcon from "../assets/sidebar/home.svg";
import learnIcon from "../assets/sidebar/learn.svg";
import testIcon from "../assets/sidebar/test.svg";
import infoIcon from "../assets/sidebar/infor.svg";
import settingIcon from "../assets/sidebar/setting.svg";
import sidebarLogo from "../assets/sidebar/sidebarLogo.svg";

import { useNavigate, useLocation } from "react-router-dom";

const menus = [
  { name: "Home", icon: homeIcon, path: "/" },
  { name: "Learn", icon: learnIcon, path: "/learn" },
  { name: "Test", icon: testIcon, path: "/test" },
  { name: "Information", icon: infoIcon, path: "/information" },
];

// 유저 네임 앞자리만 가져오기
function getProfileInitial(userName) {
  if (!userName) return "";
  const parts = userName.trim().split(" ");
  if (parts.length > 1) {
    return parts[1][0] || ""; // 첫 번째 띄어쓰기 뒤 첫 글자
  }
  return userName[0];
}

const SideBar = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인
  const initial = getProfileInitial(userName);

  return (
    <aside className="sticky top-0 left-0 flex flex-col min-w-[230px] h-screen bg-neutral ">
      {/* 로고 */}
      <div className="flex items-center justify-center h-24">
        <img src={sidebarLogo} alt="OPICoach Logo" className="h-10" />
      </div>
      {/* 메뉴 */}
      <nav className="flex-1 mt-10 mx-1 ">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;
          return (
            <button
              key={menu.name}
              onClick={() => navigate(menu.path)}
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
        <span className="text-black font-medium">{userName}</span>
        <button
          className="ml-auto hover:bg-gray-100 rounded-full"
          //   onClick={() => navigate("/setting")}
          title="설정"
        >
          <img src={settingIcon} alt="설정" className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
