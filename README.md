# OPICoach

## 소개
![image](https://github.com/user-attachments/assets/6797e14e-5070-4b86-824a-6ada4dd51263)


**오픽코치(OPIcoach)** 는 OPIc(Oral Proficiency Interview, computer) 시험 준비를 위한 맞춤형 학습 플랫폼입니다. 취업 시장에서 OPIc의 중요성이 커짐에 따라, 분산된 학습 자료와 개인화 코칭의 부재라는 기존 OPIc 학습의 문제점을 해결하고자 개발되었습니다. 스픽(Spik)의 실시간 음성인식 및 피드백, ChatGPT의 개인화된 대화 기능 등 기존 플랫폼의 장점을 융합하여, 편리하고 개인 맞춤화된 OPIC 시험 지원 서비스를 제공합니다.

<br>

## 주요 기능

### 1. 온보딩 설문(Onboarding Survey)
- 최근 OPIc 성적, 목표 등급, 실제 시험과 유사한 설문 문항으로 구성
- 유저의 답변은 이후 질문 생성 및 학습 경로 추천에 활용됨

### 2. 홈(Home)
- 현재 등급, 목표 등급, 설문 답변 기록, 실력 변화 추이를 한눈에 확인

### 3. 학습(Learn)
- 챗봇을 통한 OPIc 시험 정보, 공부 방법 등 질의응답
- 유저 입력 + DB 자료(RAG) + 프롬프트를 활용해 LLM이 답변 생성

### 4. 노트(Note)
- Learn에서의 대화 내용을 노트 형식으로 재구성하여 제공
- 복습 및 자기주도 학습에 용이

### 5. 단어/숙어(Vocab/Idiom)
- 영어 단어 및 숙어를 퀴즈 형식으로 학습

### 6. 모의시험(Test)
- 실제 OPIc 스타일의 질문 출제 및 답변 작성
- 자동 피드백: Good Point, Bad Point, Overall Feedback, 평가 지표(유창성, 문법, 어휘, 내용 전달력) 제공
- 모범 답안(Teacher's Answer) 비교 제공

### 7. 모의시험 기록(Test History)
- 지난 모의시험 답변, 피드백 다시 보기 가능

<br>

## 기술 스택

### Frontend
- React, Tailwindcss, Recoil, Vite

### Backend
- Python, MySQL, ChromaDB, FastAPI, OpenAI API


<br>

## 기술적 특징

- **유저 정보 기반 질문 생성:**  
  - 온보딩 설문 응답을 바탕으로 개인화된 질문 생성  
  - 개인화와 다양성의 균형을 위해, 유저 특성을 반영하되 다양한 시나리오의 질문이 출제됨  
  - 유사도 측정: 키워드 기반(Explicit), 문장 임베딩 기반(Semantic) 방식 적용
  - 개선 과정에서 과도한 개인화 문장 감소 및 자연스러운 질문 생성 비율 증가

- **학습 자료 DB:**  
  - Youtube 등에서 다양한 OPIc 강의 영상을 수집하여 DB화

<br>


## 프로젝트 팀

- 이준희, 강나현, 박민호, 박태준, 전지원

<br>


## 사용 예시

1. 회원가입 및 온보딩 설문 응답
2. 홈에서 자신의 목표와 현황 확인
3. Learn 챗봇에서 OPIc 공부법 질문
4. Note에서 대화 내용 복습
5. Vocab/Idiom 퀴즈로 어휘력 강화
6. Test에서 모의시험 응시 및 자동 피드백 확인

<br>

## 기대 효과

- 분산된 OPIc 학습 자료의 통합 제공
- 개인별 맞춤형 학습 코칭 및 실력 향상
- 실제 시험과 유사한 환경에서의 반복 연습 및 즉각적 피드백 제공
