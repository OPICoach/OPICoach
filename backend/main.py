import os
import pyaudio
import wave
from google.cloud import speech
from google.cloud import texttospeech
import threading
import asyncio
from sentence_transformers import SentenceTransformer
import chromadb
from openai import AsyncOpenAI
import time
import pygame
import random

from dotenv import load_dotenv

# Google Cloud Speech-to-Text 설정
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./opicoach-e1cb367c0382.json"

# 경로 설정
CHROMA_DB_DIR = "./chroma_db"
TIPS_COLLECTION_NAME = "tips_docs"
FEEDBACKS_COLLECTION_NAME = "feedbacks_docs"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
PROMPT_FILE = "./prompt/prompt_test.txt"
PROMPT_MAKEEXAM_FILE = "./prompt/prompt_makeexam.txt"
PROMPT_FEEDBACKS_FILE = "./prompt/prompt_feedbacks.txt"

# 모델 및 DB 초기화
embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
tips_collection = chroma_client.get_or_create_collection(name=TIPS_COLLECTION_NAME)
feedbacks_collection = chroma_client.get_or_create_collection(name=FEEDBACKS_COLLECTION_NAME)

# Gemini(OpenAI 호환 API) 클라이언트
openai_client = AsyncOpenAI(
    api_key=os.environ.get('API_KEY'),
    base_url="https://generativelanguage.googleapis.com/v1beta/"
)
model_name = "gemini-2.5-pro-preview-05-06"

# Google Cloud Text-to-Speech 클라이언트 초기화
tts_client = texttospeech.TextToSpeechClient()

# 프롬프트 불러오기
def load_prompt_template(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return "Answer the question based on the following context:\n\n{context}\n\nQuestion: {question}"

# 유사 문서 검색
def retrieve_context(query, collection, top_k=3):
    query_embedding = embed_model.encode([query])[0].tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    documents = results.get("documents", [])
    if documents:
        flat_docs = [doc for sublist in documents for doc in sublist if isinstance(doc, str)]
        return "\n\n".join(flat_docs)
    else:
        return ""

# 랜덤 문서 검색 (피드백 DB에서)
def retrieve_random_context(collection, n_results=10):
    all_ids = collection.get(include=[])['ids']
    if not all_ids:
        return ""
    random_ids = random.sample(all_ids, min(n_results, len(all_ids)))
    results = collection.get(ids=random_ids, include=["documents"])
    documents = results.get("documents", [])
    if documents:
        flat_docs = [doc for sublist in documents for doc in sublist if isinstance(doc, str)]
        return "\n\n".join(flat_docs)
    else:
        return ""

# 특정 질문-답변 관련 문서 검색 (피드백 DB에서)
def retrieve_related_context(collection, question, answer, n_results=10):
    combined_query = f"Question: {question}\nAnswer: {answer}"
    query_embedding = embed_model.encode([combined_query])[0].tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=n_results)
    documents = results.get("documents", [])
    if documents:
        flat_docs = [doc for sublist in documents for doc in sublist if isinstance(doc, str)]
        return "\n\n".join(flat_docs)
    else:
        return ""

# 출력 후처리 (이모티콘 제거)
def postprocess_output(text):
    cleaned_text = ''.join(char for char in text if char.isalnum() or char.isspace() or char in ['.', ',', '?', '!'])
    return cleaned_text.replace("*", "").strip()

# LLM 호출
async def ask_llm(question, answer, context, prompt_template, history=None):
    prompt = prompt_template.format(context=context, question=question, answer=answer)
    messages = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": prompt})

    response = await openai_client.chat.completions.create(
        model=model_name,
        messages=messages,
    )
    raw_output = response.choices[0].message.content.strip()
    return postprocess_output(raw_output)

# 실시간 음성 인식 (사용자 입력 종료 시간 적용)
def recognize_speech_from_microphone(timeout=5):
    client = speech.SpeechClient()
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
    print(f"\n🎤 \033[1;32m음성을 {timeout}초 동안 말해주세요...\033[0m")  # 녹색 강조
    audio_data = b""  # 음성 데이터 초기화
    start_time = time.time()
    while True:
        audio_data += stream.read(1024)
        if time.time() - start_time > timeout:
            print(f"⏱️ \033[1;33m{timeout}초가 경과했습니다. 음성을 종료합니다.\033[0m")  # 노란색 강조
            break
    audio = speech.RecognitionAudio(content=audio_data)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="ko-KR",
        alternative_language_codes=["en-US"],
        model="latest_short",
        use_enhanced=True,
        speech_contexts=[speech.SpeechContext(phrases=["오픽", "opic", "오픽 시험", "opic test"], boost=20.0)]
    )
    try:
        response = client.recognize(config=config, audio=audio)
        if response.results:
            transcript = response.results[0].alternatives[0].transcript
            print(f"📝 \033[1;34m인식된 음성:\033[0m {transcript}")  # 파란색 강조
            return transcript
        else:
            print("🔇 \033[1;31m음성이 인식되지 않았습니다.\033[0m")  # 빨간색 강조
            return ""
    except Exception as e:
        print(f"⚠️ \033[1;31m음성 인식 오류:\033[0m {e}")  # 빨간색 강조
        return ""

# 텍스트를 음성으로 변환하고 재생하는 함수
def speak_response(text, voice_name="ko-KR-Chirp3-HD-Leda"):
    text = text.lower().replace("opic", "오픽").replace("OPIc", "오픽").replace("topic", "토픽")

    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(language_code="ko-KR", name=voice_name)
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    try:
        response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        with open("output.mp3", "wb") as out:
            out.write(response.audio_content)
            print(f"🔊 음성 파일 저장 완료: output.mp3 (화자: {voice_name})")
        pygame.mixer.init()
        pygame.mixer.music.load("output.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        pygame.mixer.quit()
        os.remove("output.mp3")
        print("🗑️ 임시 음성 파일 제거 완료.")
    except Exception as e:
        print(f"⚠️ TTS 오류: {e}")

# 사용자 선택 처리
def get_input_method():
    while True:
        print("\n\033[1;36m💬 답변 방법을 선택하세요:\033[0m")  # 청록색 강조
        choice = input("1. 텍스트로 답변\n2. 음성으로 답변\n(\033[1;36m텍스트/음성\033[0m): ").strip().lower()  # 청록색 강조
        if choice == "텍스트":
            return "텍스트"
        elif choice == "음성":
            return "음성"
        else:
            print("⚠️ \033[1;31m잘못된 선택입니다. '텍스트' 또는 '음성'을 입력해주세요.\033[0m")  # 빨간색 강조

def get_mode_choice():
    while True:
        print("\n\033[1;36m💬 모드를 선택하세요:\033[0m")  # 청록색 강조
        choice = input("1. 학습 모드\n2. 시험 모드\n(\033[1;36m학습/시험\033[0m): ").strip().lower()  # 청록색 강조
        if choice == "학습":
            return "학습"
        elif choice == "시험":
            return "시험"
        else:
            print("⚠️ \033[1;31m잘못된 선택입니다. '학습' 또는 '시험'을 입력해주세요.\033[0m")  # 빨간색 강조

# 사용자 선택 처리: 음성 출력 여부 추가 (Y/N)
def get_audio_output_choice():
    while True:
        choice = input("\n\033[1;36m💬 음성 피드백을 들을까요? (Y/N): \033[0m").strip().upper()
        
        if choice == "Y":
            return True
        elif choice == "N":
            return False
        else:
            print("⚠️ \033[1;31m잘못된 선택입니다. 'Y' 또는 'N'을 입력해주세요.\033[0m")  # 빨간색 강조

async def exam_mode():
    prompt_makeexam_template = load_prompt_template(PROMPT_MAKEEXAM_FILE)
    prompt_feedbacks_template = load_prompt_template(PROMPT_FEEDBACKS_FILE)
    exam_history = []
    question_number = 0

    while True:
        question_number += 1
        print(f"\n\033[1;33m📝 시험 문제 {question_number}\033[0m") # 노란색 강조
        context_question = retrieve_random_context(feedbacks_collection, n_results=10)
        question = await ask_llm("", "", context_question, prompt_makeexam_template)
        print(f"\033[1;34m❓ 질문:\033[0m {question}") # 파란색 강조
        print("\n\033[1;32m⏳ 3초 후 답변을 시작하세요...\033[0m") # 녹색 강조
        time.sleep(3)

        input_method = get_input_method()
        user_answer = ""
        if input_method == "텍스트":
            user_answer = input("\n\033[1;36m💬 답변을 입력해주세요 (30초 제한): \033[0m") # 청록색 강조
            # 실제 시험에서는 30초 제한 로직 필요
        elif input_method == "음성":
            print("\n\033[1;36m💬 30초 동안 답변해주세요...\033[0m") # 청록색 강조
            user_answer = recognize_speech_from_microphone(timeout=30)
            # 실제 시험에서는 30초 제한 로직 필요

        print(f"\n\033[1;35m🗣️ 당신의 답변:\033[0m {user_answer}") # 보라색 강조

        context_feedback = retrieve_related_context(feedbacks_collection, question, user_answer, n_results=10)
        feedback = await ask_llm(question, user_answer, context_feedback, prompt_feedbacks_template)
        print(f"\n\033[1;33m🔧 피드백:\033[0m\n{feedback}") # 노란색 강조
        if get_audio_output_choice():
            speak_response(feedback)

        exam_history.append({
            "question": question,
            "answer": user_answer,
            "feedback": feedback,
            "number": question_number
        })

        while(True):
            continue_exam = input("\n\033[1;36m계속해서 시험을 보시겠습니까? (Y/N): \033[0m").strip().upper()

            if continue_exam == "Y":
                break
            
            elif continue_exam == "N":
                # 시험 종료 시 각 문제별 결과 저장
                if exam_history:
                    print("\n\033[1;32m💾 각 시험 문제별 결과를 저장합니다...\033[0m") # 녹색 강조

                    save_dir = "test_result"
                    os.makedirs(save_dir, exist_ok=True)

                    for entry in exam_history:
                        filename = f"opic_question_{entry['number']}_{time.strftime('%Y%m%d_%H%M%S')}.txt"
                        filepath = os.path.join(save_dir, filename)

                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(f"--- 문제 {entry['number']} ---\n")
                            f.write(f"질문: {entry['question']}\n")
                            f.write(f"답변: {entry['answer']}\n")
                            f.write(f"피드백:\n{entry['feedback']}\n")
                        print(f"📄 문제 {entry['number']} 결과가 '{filename}'으로 저장되었습니다.")
                    print("\n\033[1;32m🎉 모든 시험 결과 저장이 완료되었습니다.\033[0m") # 녹색 강조
                else:
                    print("\n\033[1;33m⚠️ 진행된 시험 문제가 없습니다.\033[0m") # 노란색 강조
                return
            else:
                print("⚠️ \033[1;31m잘못된 선택입니다. 'Y' 또는 'N'을 입력해주세요.\033[0m") # 빨간색 강조

async def learning_mode():
    prompt_template = load_prompt_template(PROMPT_FILE)
    chat_history = []
    while True:
        input_method = get_input_method()
        question = ""
        if input_method == "텍스트":
            question = input("\n\033[1;34m❓ 질문을 입력해주세요 (종료하려면 'end' 입력):\033[0m ")  # 파란색 강조
        elif input_method == "음성":
            timeout = int(input("\n\033[1;33m⏰ 음성 인식을 몇 초 동안 할까요? (초 단위 입력):\033[0m "))  # 노란색 강조
            question = recognize_speech_from_microphone(timeout=timeout)

        if question.lower().strip() == "end":
            print("\n\033[1;31m🛑 종료합니다.\033[0m")  # 빨간색 강조
            break

        try:
            context = retrieve_context(question, tips_collection)
            answer = await ask_llm(question, "", context, prompt_template, chat_history)
            print(f"\n\033[1;35m🧠 답변:\033[0m\n{answer}")  # 보라색 강조

            # 음성 출력 여부 확인
            if get_audio_output_choice():
                speak_response(answer)

            chat_history.append({"role": "user", "content": question})
            chat_history.append({"role": "assistant", "content": answer})

            print("\n\033[1;30m--- 대화 기록 ---\033[0m")  # 회색 강조
            for turn in chat_history:
                role = turn["role"]
                content = turn["content"]
                if role == "user":
                    print(f"\033[1;34m사용자:\033[0m {content}")  # 파란색 강조
                elif role == "assistant":
                    print(f"\033[1;35mOPICoach:\033[0m {content}")  # 보라색 강조
                    print()
            print("\033[1;30m-------------------\033[0m")  # 회색 강조

        except Exception as e:
            print(f"\n\033[1;31m⚠️ 오류 발생:\033[0m {e}")  # 빨간색 강조

# 메인 함수
async def main():
    pygame.init()
    print("\n\033[1;32m🎉 OPICoach에 오신 것을 환영합니다!\033[0m")  # 녹색 강조

    mode = get_mode_choice()

    if mode == "학습":
        await learning_mode()
    elif mode == "시험":
        await exam_mode()

if __name__ == "__main__":
    asyncio.run(main())