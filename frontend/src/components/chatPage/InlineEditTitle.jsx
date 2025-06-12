import { useState, useEffect, useRef } from "react";
import {
  patchLearningSessionAPI,
  getLearningSessionsAPI,
} from "../../api/api.js";
import { aiLoadingState } from "../../atom/learnAtom.js";
import { useRecoilState } from "recoil";

const InlineEditTitle = ({
  value,
  userPk,
  sessionPk,
  onSave,
  disabled,
  setLearningSessionList,
  messages = [],
}) => {
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [isAILoading] = useRecoilState(aiLoadingState);

  // user 메시지 개수 계산
  const userMessageCount = messages.filter(
    (m) =>
      m.role === "user" &&
      typeof m.content === "string" &&
      m.content.trim() !== ""
  ).length;

  // 제목 수정 가능 조건: 세션 활성 + user 메시지 1개 이상 + AI 미로딩 + 미로딩
  const canEdit = !disabled && userMessageCount > 0 && !isAILoading && !loading;

  // 툴팁 메시지
  let tooltip = "제목 수정";
  if (isAILoading) {
    tooltip = "AI 응답 중에는 제목을 수정할 수 없습니다";
  } else if (userMessageCount === 0) {
    tooltip = "메시지를 먼저 입력해야 제목을 수정할 수 있습니다";
  }

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  const handleSave = async () => {
    setEditMode(false);
    if (!inputValue.trim() || inputValue === value || !canEdit) {
      setInputValue(value);
      return;
    }
    try {
      setLoading(true);
      await patchLearningSessionAPI(userPk, sessionPk, inputValue.trim());
      if (onSave) onSave(inputValue.trim());
      if (setLearningSessionList) {
        const res = await getLearningSessionsAPI(userPk);
        setLearningSessionList(res.data?.sessions || []);
      }
    } catch (e) {
      alert("제목 저장에 실패했습니다.");
      setInputValue(value);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setInputValue(value);
      setEditMode(false);
    }
  };

  if (editMode) {
    return (
      <input
        ref={inputRef}
        className="text-lg text-gray-500 border-b border-gray-300 px-1 max-w-[300px]"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={!canEdit}
      />
    );
  }

  return (
    <span
      className={`text-lg text-gray-500 truncate max-w-[300px] px-1 rounded-md ${
        canEdit
          ? "cursor-pointer hover:bg-gray-100"
          : "opacity-50 cursor-not-allowed"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => canEdit && setEditMode(true)}
      title={tooltip}
    >
      {value || "제목 없음"}
    </span>
  );
};

export default InlineEditTitle;
