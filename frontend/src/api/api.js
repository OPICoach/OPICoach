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
export async function postLearningNoteAPI({ user_pk, session_pk, title, LLM_model = "gemini-2.0-flash" }) {
  const response = await axios.post(`${API_BASE_URL}/note/notes/create`, {
    user_pk,
    session_pk,
    title,
    LLM_model
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


// 테스트

// 질문 생성
export const fetchExamQuestion = async (userPk, model = "gemini-2.0-flash") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exam/question`, {
      params: {
        user_pk: userPk,
        LLM_model: model
      },
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error fetching exam question:', error);
    throw error;
  }
};

// 시험 피드백 요청
export const fetchExamFeedback = async ({ question, questionNumber, userPk, audioBlob, LLM_model = "gemini-2.0-flash" }) => {
    try {
        const formData = new FormData();
        // JSON 데이터를 문자열로 변환하여 전송
        const requestData = {
            question,
            question_number: questionNumber,
            user_pk: userPk,
            LLM_model
        };
        
        console.log('Sending request data:', requestData);
        console.log('Audio blob type:', audioBlob.type);
        
        formData.append('request', JSON.stringify(requestData));
        formData.append('user_answer_audio', audioBlob, 'answer.webm');

        const response = await axios.post(
            `${API_BASE_URL}/exam/feedback`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || '피드백 생성 중 오류가 발생했습니다.');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching exam feedback:', error);
        if (error.response) {
            throw new Error(error.response.data.message || '피드백 생성 중 오류가 발생했습니다.');
        } else if (error.request) {
            throw new Error('서버로부터 응답을 받지 못했습니다.');
        } else {
            throw new Error(error.message || '피드백 생성 중 오류가 발생했습니다.');
        }
    }
};

// 오디오 파일 가져오기
export const fetchAudioFile = async (filePath) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/exam/audio/${filePath}`,
            {
                responseType: 'arraybuffer'
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching audio file:', error);
        throw new Error('오디오 파일을 가져오는데 실패했습니다.');
    }
};

// 바이너리 데이터에서 특정 시퀀스를 찾는 함수
function findSequence(array, sequence) {
    for (let i = 0; i <= array.length - sequence.length; i++) {
        let found = true;
        for (let j = 0; j < sequence.length; j++) {
            if (array[i + j] !== sequence[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i;
        }
    }
    return -1;
}

// MP3를 WAV로 변환하는 함수
async function convertToWav(mp3Blob) {
  // AudioContext를 사용하여 MP3를 WAV로 변환
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await mp3Blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // WAV 파일 생성
  const wavBlob = await audioBufferToWav(audioBuffer);
  return wavBlob;
}

// AudioBuffer를 WAV Blob으로 변환하는 함수
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const buffer2 = new ArrayBuffer(44 + length);
  const view = new DataView(buffer2);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // WAV 헤더 작성
  setUint32(0x46464952);                         // "RIFF"
  setUint32(36 + length);                        // 파일 크기
  setUint32(0x45564157);                         // "WAVE"
  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // fmt chunk 크기
  setUint16(1);                                  // 오디오 포맷 (1 = PCM)
  setUint16(numOfChan);                          // 채널 수
  setUint32(buffer.sampleRate);                  // 샘플레이트
  setUint32(buffer.sampleRate * 2 * numOfChan);  // 바이트레이트
  setUint16(numOfChan * 2);                      // 블록 얼라인
  setUint16(16);                                 // 비트 심도
  setUint32(0x61746164);                         // "data" chunk
  setUint32(length);                             // data chunk 크기

  // 채널 데이터 작성
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  // 인터리브 채널 데이터
  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([buffer2], { type: 'audio/wav' });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// 저장된 시험 피드백 전체 가져오기
export const fetchExamHistory = async (userPk) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exam/history?user_pk=${userPk}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam history:', error);
    throw error;
  }
};

// 사용자 정보 가져오기
export const fetchUserInfo = async (userPk) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/info/${userPk}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// 사용자 정보 업데이트 API
export const updateUserInfo = async (userPk, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/update_info/${userPk}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 테스트 시작 API
export const startTestAPI = async (userPk) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/test/start`, { user_pk: userPk });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 테스트 제출 API
export const submitTestAPI = async (testData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/test/submit`, testData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 테스트 히스토리 조회 API
export const fetchTestHistory = async (userPk) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/test/history/${userPk}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// vocab

// 단어 문제 받아오기
export async function fetchVocabQuestion(user_pk) {
  const response = await axios.get(`${API_BASE_URL}/vocab/question`, {
    params: { user_pk }
  });
  return response.data; // { id, word }
}