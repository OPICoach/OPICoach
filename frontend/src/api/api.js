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

// 학습 모드

// 새로운 학습 세션 생성
export async function postLearningSessionAPI(user_pk, title) {
  const response = await axios.post(`${API_BASE_URL}/learning/sessions`, {
    user_pk,
    title,
  });
  return response.data;
}

// 학습 모드에서 사용자의 질문에 대한 답변 생성
export async function postLearningResponseAPI({
  user_pk,
  session_id,
  question,
}) {
  const response = await axios.post(`${API_BASE_URL}/learning/response`, {
    user_pk,
    session_id,
    question,
  });
  return response.data; // { answer: "..." }
}

// 학습 세션의 채팅 내용 종료 처리
export async function endLearningSessionAPI({ user_pk, session_id }) {
  const response = await axios.post(`${API_BASE_URL}/learning/sessions/end`, {
    user_pk,
    session_id,
  });
  return response.data;
}

// 학습 세션 채팅 내용 전달
export async function endLearningSessionWithChatAPI(
  user_pk,
  session_id,
  chat_content
) {
  const response = await axios.post(
    `${API_BASE_URL}/learning/sessions/${user_pk}/${session_id}/end`,
    null,
    { params: { chat_content } }
  );
  return response.data;
}

// 사용자의 학습 세션 목록 조회
export async function getLearningSessionsAPI(user_pk) {
  const response = await axios.get(
    `${API_BASE_URL}/learning/sessions/${user_pk}`
  );
  return response.data; // Array of session objects
}

// 특정 학습 세션 정보 조회
export async function getLearningSessionAPI(user_pk, session_id) {
  const response = await axios.get(
    `${API_BASE_URL}/learning/sessions/${user_pk}/${session_id}`
  );
  return response.data; // Session object
}

// 학습 세션 정보 업데이트 (title, description)
export async function patchLearningSessionAPI(
  user_pk,
  session_id,
  { title, description }
) {
  const response = await axios.patch(
    `${API_BASE_URL}/learning/sessions/${user_pk}/${session_id}`,
    null,
    { params: { title, description } }
  );
  return response.data;
}

// 세션 대화 내용을 바탕으로 학습 노트 생성
export async function postLearningNoteAPI({ user_pk, session_id, title }) {
  const response = await axios.post(`${API_BASE_URL}/learning/notes`, {
    user_pk,
    session_id,
    title,
  });
  return response.data; // { id, user_pk, session_id, title, content, created_at }
}

// 사용자의 학습 노트 목록 조회
export async function getLearningNotesAPI(user_pk) {
  const response = await axios.get(`${API_BASE_URL}/learning/notes/${user_pk}`);
  return response.data; 
}

// 특정 학습 노트 삭제
export async function deleteLearningNoteAPI(note_id, user_pk) {
  const response = await axios.delete(
    `${API_BASE_URL}/learning/notes/${note_id}`,
    { params: { user_pk } }
  );
  return response.data;
}
