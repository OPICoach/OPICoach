import homeIcon from "../assets/sidebar/home.svg";
import learnIcon from "../assets/sidebar/learn.svg";
import testIcon from "../assets/sidebar/test.svg";
import infoIcon from "../assets/sidebar/infor.svg";
import settingIcon from "../assets/sidebar/setting.svg";
import sidebarLogo from "../assets/sidebar/sidebarLogo.svg";
import profileEllipse from "../assets/sidebar/profileEllipse.svg";

import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const menus = [
  { name: "Home", icon: homeIcon, path: "/home" },
  { name: "Learn", icon: learnIcon, path: "/learn" },
  { name: "Test", icon: testIcon, path: "/test" },
  { name: "Information", icon: infoIcon, path: "/information" },
];

const SideBar = (userName) => {
  return (
    <aside className="flex flex-col w-56 h-screen bg-neutral">
      {/* 로고 */}
      <div className="flex items-center justify-center h-24">
        <img src={sidebarLogo} alt="OPICoach Logo" className="h-10" />
      </div>
      {/* 메뉴 */}
      <nav className="flex-1 mt-8">
        {menus.map((menu) => (
          <a
            key={menu.name}
            href={menu.path}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition"
          >
            <img src={menu.icon} alt={menu.name} className="w-6 h-6 mr-4" />
            <span>{menu.name}</span>
          </a>
        ))}
      </nav>
      {/* 설정 */}
      <div className="mt-auto mb-8 px-6">
        <a
          href="/settings"
          className="flex items-center text-gray-500 hover:text-blue-600"
        >
          <img src={settingIcon} alt="Settings" className="w-5 h-5 mr-3" />
          <span>설정</span>
        </a>
      </div>
      {/* 유저 정보 (옵션) */}
      <div className="flex items-center px-6 pb-6">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          {/* 유저 프로필 아이콘 자리 */}
          <span className="text-gray-500 font-bold">H</span>
        </div>
        <span className="text-gray-700 font-medium">Gildong Hong</span>
      </div>
    </aside>
  );
};

export default SideBar;
