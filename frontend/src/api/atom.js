import { atom } from "recoil";
export const userDataState = atom({
  key: "userDataState",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const saved = localStorage.getItem("userDataState");
      if (saved != null) setSelf(JSON.parse(saved));

      onSet((newValue, _, isReset) => {
        if (isReset || newValue == null) {
          localStorage.removeItem("userDataState");
        } else {
          localStorage.setItem("userDataState", JSON.stringify(newValue));
        }
      });
    },
  ],
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
