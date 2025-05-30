import React, { useState, useRef, useEffect } from "react";
import { FaRobot } from "react-icons/fa6";

const MenuSettingsButton = ({ onChangeModel, isDisabled }) => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false); // 메뉴 팝업용 (원래 기능 유지)
  const menuRef = useRef(null);

  // 바깥 클릭 시 메뉴 닫기 (원래 기능 유지)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative select-none" ref={menuRef}>
      {/* 토글 버튼 */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setActive(!active)}
      >
        <div
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            active ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
              active ? "left-7" : "left-1"
            }`}
          />
        </div>
        <span className="ml-2">{active ? "추론" : "기본"}</span>
      </div>

      {/* 아래는 기존 메뉴 팝업 기능 (필요시 사용) */}
      {open && (
        <div
          className="absolute left-0 mb-2 w-44 bg-white border border-gray-200 rounded-xl shadow-md z-20 animate-fade-in"
          style={{
            bottom: "100%",
            top: "auto",
            minWidth: "180px",
            padding: "8px 0",
          }}
        >
          <button
            className="flex items-center w-full gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition rounded-md"
            onClick={() => {
              setOpen(false);
              onChangeModel && onChangeModel();
            }}
          >
            <FaRobot className="text-blue-500" />
            모델 변경
          </button>
        </div>
      )}
      <style>
        {`
          .animate-fade-in {
            animation: fadeInDropdown 0.18s ease;
          }
          @keyframes fadeInDropdown {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
};

export default MenuSettingsButton;
