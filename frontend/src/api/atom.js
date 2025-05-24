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

export const sideBarState = atom({
  key: "sideBarState",
  default: true,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const saved = localStorage.getItem("sideBarState");
      if (saved != null) setSelf(JSON.parse(saved));

      onSet((newValue, _, isReset) => {
        if (isReset || newValue == null) {
          localStorage.removeItem("sideBarState");
        } else {
          localStorage.setItem("sideBarState", JSON.stringify(newValue));
        }
      });
    },
  ],
});

export const userMessagesFillerState = atom({
  key: "userMessagesFillerState",
  default: [],
});

export const AIMessagesFillerState = atom({
  key: "AIMessagesFillerState",
  default: ["Hello!"],
});

export const userMessagesInforState = atom({
  key: "userMessagesInforState",
  default: [],
});

export const AIMessagesInforState = atom({
  key: "AIMessagesInforState",
  default: ["Hello"],
});

export const userMessagesMaterialState = atom({
  key: "userMessagesMaterialState",
  default: [],
});

export const AIMessagesMaterialState = atom({
  key: "AIMessagesMaterialState",
  default: ["Hello! How can I assist you today?"],
});

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
