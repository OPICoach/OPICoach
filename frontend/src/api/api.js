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

// 회원 정보 가져오는 API
export async function getUserInfoAPI(pk) {
  const response = await axios.get(`${API_BASE_URL}/users/info/${pk}`);
  return response.data.user;
}

// 회원 정보 업데이트 API
export async function updateUserInfoAPI(data) {
  const response = await axios.post(`${API_BASE_URL}/users/update_info`, {
    user_pk: data.user_pk,
    past_opic_level: data.past_opic_level,
    goal_opic_level: data.goal_opic_level,
    background: data.background,
    occupation_or_major: data.occupation_or_major,
    topics_of_interest: data.topics_of_interest,
  });
  return response.data;
}
