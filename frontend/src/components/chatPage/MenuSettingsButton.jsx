import React, { useState, useRef, useEffect } from "react";
import { FaRegNoteSticky, FaRobot } from "react-icons/fa6"; // 예시 아이콘

const MenuSettingsButton = ({ onCreateNote, onChangeModel, isDisabled }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // 바깥 클릭 시 메뉴 닫기
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
      <button
        type="button"
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isDisabled}
        title="메뉴 설정"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span style={{ fontWeight: "bold", fontSize: "20px" }}>⋯</span>
      </button>
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
              onCreateNote();
            }}
          >
            <FaRegNoteSticky className="text-yellow-500" />
            노트 생성
          </button>
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
      {/* 애니메이션: Tailwind 기준 animate-fade-in 클래스 필요. 없으면 직접 추가 */}
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
