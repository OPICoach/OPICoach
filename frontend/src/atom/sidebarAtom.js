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

// sidebar 열림 닫힘 상태를 관리
export const sideBarState = atom({
  key: "sideBarState",
  default: true,
});

// sidebar learn page 메뉴 상태
export const learnOpenState = atom({
  key: "learnOpenState",
  default: false,
});

// loading 상태 관리
export const loadingSessionsState = atom({
  key: "loadingSessionsState",
  default: false,
});

// 사전 서베이 상태 관리
export const surveyState = atom({
  key: "surveyState",
  default: false,
});
