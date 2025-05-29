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

export const aiLoadingState = atom({
  key: "aiLoadingState",
  default: false,
});

// learn Session 관련 상태 관리

export const learnSessionPkState = atom({
  key: "learnSessionPkState",
  default: null,
  effects: [localStorageEffect("sessionPk")],
});

export const learnSessionState = atom({
  key: "learnSessionState",
  default: {
    session_pk: null,
    title: "",
    user_pk: null,
    created_at: null,
  },
});

export const learningSessionListState = atom({
  key: "learningSessionListState",
  default: [],
});

