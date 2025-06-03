import React, { useState, useRef, useEffect } from "react";
import { aiModelState } from "../../atom/learnAtom.js";
import { useRecoilState } from "recoil";

const MenuSettingsButton = ({ onChangeModel, isDisabled }) => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false); // 메뉴 팝업용 (원래 기능 유지)
  const menuRef = useRef(null);
  const [aiModel, setAiModel] = useRecoilState(aiModelState); // AI 모델 상태 관리
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (active) {
      setAiModel("gemini-2.5-pro-preview-05-06"); // 추론 모드 활성화 시 모델 변경
    } else {
      setAiModel("gemini-2.0-flash"); // 기본 모드 활성화 시 모델 변경
    }
  }, [active]);

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
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            active ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
              active ? "left-6" : "left-1"
            }`}
          />
        </div>
        <span className="ml-2">{active ? "Inference" : "Default"}</span>
        {showTooltip && (
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg z-30"
            style={{ whiteSpace: "nowrap" }}
          >
            {active
              ? "AI Model: gemini-2.5-pro-preview-05-06"
              : "AI Model: gemini-2.0-flash"}
          </div>
        )}
      </div>

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
