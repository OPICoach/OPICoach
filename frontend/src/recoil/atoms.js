import { atom } from "recoil";

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