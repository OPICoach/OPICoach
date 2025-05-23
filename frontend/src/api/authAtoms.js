import { atom } from "recoil";

export const loginDataState = atom({
  key: "loginDataState",
  default: {
    id: "",
    password: ""
  }
});

export const signUpDataState = atom({
  key: "signUpDataState",
  default: {
    name: "",
    email: "",
    id: "",
    password: ""
  }
}); 