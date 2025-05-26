import { atom } from "recoil";

const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };

// learning page user message
export const userMessagesLearnState = atom({
  key: "userMessagesLearnState",
  default: [],
});

// learning page ai message
export const AIMessagesLearnState = atom({
  key: "AIMessagesLearnState",
  default: [],
});

// learning page messages (통합)
export const messagesLearnState = atom({
  key: "messagesLearnState",
  default: [],
});

// learn Session 관련 상태 관리

export const learnSessionIdState = atom({
  key: "learnSessionIdState",
  default: "",
});

export const learnSessionState = atom({
  key: "sessionState",
  default: {
    id: null,
    session_id: "",
    title: "",
    user_pk: null,
    created_at: null,
  },
});

// 학습 세션 목록 상태
export const learningSessionListState = atom({
  key: "learningSessionsState",
  default: [],
});
