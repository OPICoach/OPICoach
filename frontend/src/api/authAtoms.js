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

export const loginDataState = atom({
  key: "loginDataState",
  default: {
    id: "",
    password: "",
  },
  effects: [localStorageEffect("loginData")],
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
