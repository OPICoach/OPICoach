import SideBar from "../components/sidebar";
import sidebarLogo from "../assets/sidebar/sidebarLogo.svg";
import { useNavigate } from "react-router-dom";

const learnMenus = [
  { name: "Study Materials", path: "/learn/studymaterials" },
  { name: "Learn Fillers", path: "/learn/fillers" },
];

const Learn = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white">
        <img
          src={sidebarLogo}
          alt="OPICoach Logo"
          className="w-[200px] shrink-0 mt-[-40px] mb-[100px]"
        />
        <div className="flex flex-col gap-10">
          {learnMenus.map((menu) => (
            <button
              key={menu.name}
              onClick={() => navigate(menu.path)}
              className="w-[300px] h-[80px] bg-gray-100 text-black text-xl rounded-xl hover:bg-gray-200 transition"
            >
              {menu.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learn;
