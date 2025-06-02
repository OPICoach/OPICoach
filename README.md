# OPICoach
소프트웨어공학개론 1조 LLM 챗서비스 "OPICoach"

## 소개

**OPICoach**는 OPIc(Oral Proficiency Interview – computer) 시험 준비를 위한 AI 기반 온라인 학습 플랫폼입니다. 사용자는 실제 OPIc 시험과 유사한 환경에서 모의 시험을 치르고, AI 피드백을 통해 말하기 능력을 체계적으로 향상시킬 수 있습니다. 맞춤형 학습, 예상 질문 QnA, 실전 모의고사, 학습 노트 등 다양한 기능을 제공합니다. AI 챗봇 및 모의시험 피드백은 OpenAI LLM과 RAG(Retrieval-Augmented Generation) 시스템을 활용해 구현됩니다.

---

## 주요 기능

- **회원가입 및 로그인**: 사용자 계정 생성, 로그인
- **홈**: 사용자 정보(레벨, 목표 등급, 시험 일정 등)와 주요 메뉴 제공
- **AI 학습**: AI 챗봇과 OPIc 관련 QnA, 대화형 학습, 과거 대화 불러오기
- **모의시험**: 실제 OPIc 시험과 유사한 방식의 모의 시험, 음성 답변 녹음/제출, AI 피드백 제공
- **학습 노트**: 학습 대화 기반 노트 생성 및 관리

---

## 페이지 구성

| 페이지명 | 주요 기능 |
| --- | --- |
| Home | 로그인 후 사용자 정보 및 주요 메뉴 표시 |
| Login | 로그인, 비밀번호 찾기, 정보 수정 |
| SignUp | 회원가입, 기본 정보 입력 |
| Learn | AI와 QnA, 대화형 학습, 피드백, 과거 대화 불러오기 |
| Test | OPIc 스타일 모의 시험, 음성 답변 녹음/제출, AI 피드백 |
| Note | 학습 대화 기반 노트 생성 및 관리 |

---

## 기술 스택

### 프론트엔드

- React
- Vite
- Recoil
- Axios
- Tailwind CSS
- React Router DOM

### 백엔드

- FastAPI (Python)
- OpenAI API (LLM)
- MySQL
- ChromaDB (벡터 DB)
- JWT
- TLS/HTTPS

