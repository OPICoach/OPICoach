import { atom } from "recoil";
export const userDataState = atom({
  key: "userDataState",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      // 초기값을 localStorage에서 가져오기
      const saved = localStorage.getItem("userDataState");
      if (saved != null) setSelf(JSON.parse(saved));

      // 값이 바뀔 때마다 localStorage에 저장
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
