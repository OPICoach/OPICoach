import { atom } from "recoil";

const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    // "undefined", null, 빈문자열 등 예외처리
    if (
      savedValue !== null &&
      savedValue !== "undefined" &&
      savedValue !== ""
    ) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch (e) {
        // 파싱 에러 시 초기화
        setSelf(null);
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset || newValue == null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };

export const loginDataState = atom({
  key: "loginDataState",
  default: {
    id: "",
    password: "",
  },
});

export const userPkState = atom({
  key: "userPkState",
  default: null,
  effects: [localStorageEffect("userPk")],
});

export const signUpDataState = atom({
  key: "signUpDataState",
  default: {
    name: "",
    email: "",
    id: "",
    password: "",
  },
});

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
