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
  const response = await axios.post(
    `${API_BASE_URL}/learning/sessions/create`,
    {
      user_pk,
      title,
    }
  );
  return response.data;
  //   {
  //   "success": true,
  //   "message": "string",
  //   "data": {
  //     "additionalProp1": {}
  //   },
  //   "session_pk": 0
  // }
}

// 학습 모드에서 사용자의 질문에 대한 답변 생성
export async function postLearningResponseAPI({
  user_pk,
  session_pk,
  question,
  LLM_model = "gemini-2.0-flash", // 기본값
}) {
  const response = await axios.post(`${API_BASE_URL}/learning/response`, {
    user_pk,
    session_pk,
    question,
    LLM_model,
  });
  return response.data; // { answer: "..." }
}

// 사용자의 학습 세션 목록 조회
export async function getLearningSessionsAPI(user_pk) {
  const response = await axios.post(`${API_BASE_URL}/learning/sessions/get`, {
    user_pk,
    session_pk: 0, // 전체 목록 조회 시 session_pk: 0
  });
  return response.data;
  // {
  //   "success": true,
  //   "message": "학습 세션 목록 조회가 완료되었습니다.",
  //   "data": {
  //     "sessions": [
  //       {
  //         "id": 2,
  //         "user_pk": 1,
  //         "title": "New Session",
  //         "chat_content": null,
  //         "created_at": "2025-05-26T23:56:18"
  //       },
  //       {
  //         "id": 1,
  //         "user_pk": 1,
  //         "title": "hello",
  //         "chat_content": "[{\"role\": \"user\", \"content\": \"hello\"}, {\"role\": \"assistant\", \"content\": \"good\"}]",
  //         "created_at": "2025-05-26T23:43:42"
  //       }
  //     ]
  //   },
  //   "session_pk": null
  // }
}

// 특정 학습 세션 정보 조회
export async function getLearningSessionAPI(user_pk, session_pk) {
  const response = await axios.post(`${API_BASE_URL}/learning/sessions/get`, {
    user_pk,
    session_pk,
  });
  return response.data;
  //   {
  //   "success": true,
  //   "message": "학습 세션 조회가 완료되었습니다.",
  //   "data": {
  //     "id": 1,
  //     "title": "hello",
  //     "chat_history": [
  //       {
  //         "role": "user",
  //         "content": "hello"
  //       },
  //       {
  //         "role": "assistant",
  //         "content": "안녕하세요! 만나서 반가워요. OPIC 시험 준비를 도와줄 선생님입니다.\n\nOPIC 시험은 얼마나 자연스럽게 영어를 사용하는지 보는 시험이라는 거, 혹시 들어보셨나요? 그래서 너무 외운 티가 나거나 딱딱하게 말하는 것보다는, 실제 대화하듯이 편안하게 이야기하는 게 중요해요.\n\n처음 시작할 때는 시험의 기본적인 틀, 예를 들면 자주 나오는 질문 유형이나 답변을 구성하는 방법 같은 것들을 익히는 게 도움이 많이 된답니다.\n\n혹시 OPIC 시험에 대해 특별히 궁금한 점이 있으신가요? 아니면 어떤 부분부터 시작하고 싶으신지 편하게 말씀해주세요. 예를 들어, 시험이 어떻게 구성되는지, 답변은 어떻게 해야 좋은 점수를 받는지 같은 것들이요!"
  //       }
  //     ]
  //   },
  //   "session_pk": 1
  // }
}

// 학습 세션 정보 업데이트 (title)
export async function patchLearningSessionAPI(user_pk, session_pk, title) {
  const response = await axios.post(
    `${API_BASE_URL}/learning/sessions/update`,
    {
      user_pk,
      session_pk,
      title,
    }
  );
  return response.data;

  // {
  //   "success": true,
  //   "message": "학습 세션 정보가 업데이트되었습니다.",
  //   "data": {
  //     "id": 1,
  //     "title": "hllo",
  //     "chat_history": [
  //       {
  //         "role": "user",
  //         "content": "hello"
  //       },
  //       {
  //         "role": "assistant",
  //         "content": "안녕하세요! 만나서 반가워요. OPIC 시험 준비를 도와줄 선생님입니다.\n\nOPIC 시험은 얼마나 자연스럽게 영어를 사용하는지 보는 시험이라는 거, 혹시 들어보셨나요? 그래서 너무 외운 티가 나거나 딱딱하게 말하는 것보다는, 실제 대화하듯이 편안하게 이야기하는 게 중요해요.\n\n처음 시작할 때는 시험의 기본적인 틀, 예를 들면 자주 나오는 질문 유형이나 답변을 구성하는 방법 같은 것들을 익히는 게 도움이 많이 된답니다.\n\n혹시 OPIC 시험에 대해 특별히 궁금한 점이 있으신가요? 아니면 어떤 부분부터 시작하고 싶으신지 편하게 말씀해주세요. 예를 들어, 시험이 어떻게 구성되는지, 답변은 어떻게 해야 좋은 점수를 받는지 같은 것들이요!"
  //       }
  //     ]
  //   },
  //   "session_pk": 1
  // }
}

// 특정 학습 세션 삭제
export async function deleteLearningSessionAPI(user_pk, session_pk) {
  const response = await axios.post(
    `${API_BASE_URL}/learning/sessions/delete`,
    {
      user_pk,
      session_pk,
    }
  );
  return response.data;
  //   {
  //   "success": true,
  //   "message": "string",
  //   "data": {
  //     "additionalProp1": {}
  //   },
  //   "session_pk": 0
  // }
}

// note

// 학습 노트 생성
export async function postLearningNoteAPI({ user_pk, session_pk, title }) {
  const response = await axios.post(`${API_BASE_URL}/note/notes/create`, {
    user_pk,
    session_pk,
    title,
  });
  return response.data;
}
// {
//   "success": true,
//   "message": "학습 노트가 성공적으로 생성되었습니다.",
//   "data": {
//     "id": 3,
//     "user_pk": 1,
//     "session_pk": 1,
//     "title": "과자",
//     "content": "OPIC "
//     "created_at": "2025-05-29T22:19:07"
//   },
//  "note_pk": 3
// }

// 학습 노트 조회 (전체 목록 또는 특정 노트)
export async function getLearningNotesAPI(user_pk, note_pk) {
  const response = await axios.post(`${API_BASE_URL}/note/notes/get`, {
    user_pk,
    note_pk, // 전체 목록 조회 시 note_pk: 0
  });
  return response.data;
}
// {
//   "success": true,
//   "message": "학습 노트 조회가 완료되었습니다.",
//   "data": {
//     "id": 1,
//     "user_pk": 1,
//     "session_pk": 1,
//     "title": "과자",
//     "content": "OPIC 시험 준비를 위한 노트입니다.",
//     "created_at": "2025-05-29T20:14:34"
//   },
//   "note_pk": 1
// }

// 학습 노트 삭제
export async function deleteLearningNoteAPI(user_pk, note_pk) {
  const response = await axios.post(`${API_BASE_URL}/note/notes/delete`, {
    user_pk,
    note_pk,
  });
  return response.data;
  //   {
  //   "success": true,
  //   "message": "string",
  //   "data": {
  //     "additionalProp1": {}
  //   },
  //   "note_pk": 0
  // }
}
