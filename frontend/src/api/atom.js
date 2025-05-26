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

// 사용자 정보 조회를 위한 atom
export const userInfoState = atom({
  key: "userInfoState",
  default: {
    id: null,
    name: "",
    email: "",
    user_id: "",
    past_opic_level: "",
    goal_opic_level: "",
    background: "",
    occupation_or_major: "",
    topics_of_interest: [],
  },
  effects: [localStorageEffect("userData")],
});

// sidebar 열림 닫힘 상태를 관리
export const sideBarState = atom({
  key: "sideBarState",
  default: true,
});

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

// learning page messages (통합))
export const messagesLearnState = atom({
  key: "messagesLearnState",
  default: [],
});

export const userMessagesInforState = atom({
  key: "userMessagesInforState",
  default: [],
});

export const AIMessagesInforState = atom({
  key: "AIMessagesInforState",
  default: ["Hello"],
});

// export const userMessagesMaterialState = atom({
//   key: "userMessagesMaterialState",
//   default: [],
// });

// export const AIMessagesMaterialState = atom({
//   key: "AIMessagesMaterialState",
//   default: ["Hello! How can I assist you today?"],
// });

// export const userMessagesFillerState = atom({
//   key: "userMessagesFillerState",
//   default: [],
// });

// export const AIMessagesFillerState = atom({
//   key: "AIMessagesFillerState",
//   default: ["Hello!"],
// });

export const timeLeftState = atom({
  key: "timeLeftState",
  default: 120,
});

export const isRunningState = atom({
  key: "isRunningState",
  default: false,
});

export const isStoppedState = atom({
  key: "isStoppedState",
  default: false,
});

export const audioURLState = atom({
  key: "audioURLState",
  default: null,
});

export const isRecordingState = atom({
  key: "isRecordingState",
  default: false,
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

// sidebar learn page 메뉴 상태
export const learnOpenState = atom({
  key: "learnOpenState",
  default: false,
});

// 학습 세션 목록 상태
export const learningSessionListState = atom({
  key: "learningSessionsState",
  default: [],
});

// 
export const loadingSessionsState = atom({
  key: "loadingSessionsState",
  default: false,
});

