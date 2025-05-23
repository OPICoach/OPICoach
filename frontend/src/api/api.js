import axios from "axios";

export const API_BASE_URL = "http://localhost:8000/api";

// 회원가입 API
export async function signupUserAPI({ name, email, id, pw }) {
  const response = await axios.post(`${API_BASE_URL}/users/signup`, {
    name,
    email,
    id,
    pw,
  });
  return response.data;
}

// 로그인 API
export async function loginUserAPI({ id, pw }) {
  const response = await axios.post(`${API_BASE_URL}/users/login`, {
    id,
    pw,
  });
  return response.data;
}
