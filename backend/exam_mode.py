# exam_mode.py
import os
import re
import json
from utils import ask_llm, load_prompt_template, feedback_to_score, exam_types
from db_utils.chroma_db_utils import retrieve_random_context, retrieve_related_context
from db_utils.user_db_utils import get_user_info, update_user_progress, save_level_history
from db_utils.exam_db_utils import save_exam_result
from pathlib import Path
import google.cloud.texttospeech as tts
import google.cloud.speech as speech
from datetime import datetime
import pygame
import random

# Google Cloud Speech-to-Text 설정
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./opicoach-e1cb367c0382.json"

#model_name = "gemini-2.5-pro-preview-05-06"
model_name = "gemini-2.0-flash"
PROMPT_MAKEEXAM_FILE = "./prompt/prompt_makeexam.txt"
PROMPT_FEEDBACKS_FILE = "./prompt/prompt_feedbacks.txt"

# Google Cloud Text-to-Speech 클라이언트 초기화
tts_client = tts.TextToSpeechClient()

async def text_to_speech(text: str, output_path: str):
    """텍스트를 음성으로 변환하여 MP3 파일로 저장합니다."""
    try:
        text = text.lower().replace("opic", "오픽").replace("OPIc", "오픽").replace("topic", "토픽")
        
        synthesis_input = tts.SynthesisInput(text=text)
        voice = tts.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Chirp3-HD-Leda"
        )
        audio_config = tts.AudioConfig(
            audio_encoding=tts.AudioEncoding.MP3
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        with open(output_path, "wb") as out:
            out.write(response.audio_content)
            print(f"🔊 음성 파일 저장 완료: {output_path}")
        
        return output_path
    except Exception as e:
        print(f"TTS 변환 중 오류 발생: {e}")
        return None

async def speech_to_text(audio_path: str, _model_name: str = "latest_long") -> str:
    """음성 파일을 텍스트로 변환합니다."""
    try:
        client = speech.SpeechClient()
        with open(audio_path, "rb") as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.MP3,
            sample_rate_hertz=16000,
            language_code="en-US",
            model=_model_name,
            use_enhanced=True,
            speech_contexts=[speech.SpeechContext(phrases=["opic", "opic test"], boost=20.0)]
        )

        response = client.recognize(config=config, audio=audio)
        if response.results:
            transcripts = []
            for result in response.results:
                if result.alternatives:
                    transcripts.append(result.alternatives[0].transcript)
            transcript = " ".join(transcripts)
            print(f"📝 인식된 음성: {transcript}")
            return transcript
        else:
            print("🔇 음성이 인식되지 않았습니다.")
            return ""
    except Exception as e:
        print(f"STT 변환 중 오류 발생: {e}")
        return ""

# 시험 문제 생성 함수 (user_pk 받아서 유저 정보 포함)
async def generate_exam_question(user_pk: int):
    """LLM을 사용하여 시험 문제를 생성하고 음성으로 변환합니다."""
    try:
        user_info = get_user_info(user_pk)
        prompt_makeexam_template = await load_prompt_template(PROMPT_MAKEEXAM_FILE)
        context_question = retrieve_random_context("exam_docs", n_results=10)

        prompt_with_user = prompt_makeexam_template.format(
            user_info=user_info_to_str(user_info),
            context=context_question,
            question="",
            answer=""
        )
        question = await ask_llm("", "", context_question, prompt_with_user, __model_name=model_name)
        
        # HTML 태그 제거
        clean_question = question.replace('<br>', ' ').replace('<br/>', ' ').replace('<br />', ' ')
        
        # 문제를 음성으로 변환
        audio_dir = Path("audio_files")
        audio_dir.mkdir(exist_ok=True)
        
        # 기존 파일들에서 가장 큰 번호 찾기
        existing_files = list(audio_dir.glob(f"question_{user_pk}_*.mp3"))
        if existing_files:
            # 파일 이름에서 번호 추출하고 최대값 찾기
            numbers = [int(f.stem.split('_')[-1]) for f in existing_files]
            next_number = max(numbers) + 1
        else:
            next_number = 1
        
        question_audio_path = f"audio_files/question_{user_pk}_{next_number}.mp3"
        
        await text_to_speech(clean_question, question_audio_path)
        
        print(f"❓ 생성된 질문: {question}")
        return question, question_audio_path
    except Exception as e:
        print(f"🔥 generate_exam_question 오류: {e}")
        raise

# 시험 문제 생성 함수 (타입 포함)
async def generate_exam_question(user_pk: int, with_type: bool = False, _model_name: str = "gemini-2.0-flash"):
    """LLM을 사용하여 시험 문제를 생성하고 음성으로 변환합니다."""
    try:
        user_info = get_user_info(user_pk)
        prompt_makeexam_template = await load_prompt_template(PROMPT_MAKEEXAM_FILE)

        if with_type:
            # 랜덤으로 시험 유형 선택
            random_type = random.choice(exam_types)
            exam_template_file = f"./txt_db/exam_templates/{random_type}.txt"
            if not os.path.exists(exam_template_file):
                raise FileNotFoundError(f"시험 템플릿 파일이 존재하지 않습니다: {exam_template_file}")
            with open(exam_template_file, 'r', encoding='utf-8') as file:
                context_question = file.read()
        else:
            context_question = retrieve_random_context("exam_docs", n_results=10)

        prompt_with_user = prompt_makeexam_template.format(
            user_info=user_info_to_str(user_info),
            context=context_question,
            question="",
            answer=""
        )
        question = await ask_llm("", "", context_question, prompt_with_user, __model_name=_model_name)
        
        # HTML 태그 제거
        clean_question = question.replace('<br>', ' ').replace('<br/>', ' ').replace('<br />', ' ')
        
        # 문제를 음성으로 변환
        audio_dir = Path("audio_files")
        audio_dir.mkdir(exist_ok=True)
        
        # 기존 파일들에서 가장 큰 번호 찾기
        existing_files = list(audio_dir.glob(f"question_{user_pk}_*.mp3"))
        if existing_files:
            # 파일 이름에서 번호 추출하고 최대값 찾기
            numbers = [int(f.stem.split('_')[-1]) for f in existing_files]
            next_number = max(numbers) + 1
        else:
            next_number = 1
        
        question_audio_path = f"audio_files/question_{user_pk}_{next_number}.mp3"
        
        await text_to_speech(clean_question, question_audio_path)
        
        print(f"❓ 생성된 질문: {question}")
        if with_type:
            print(f"📝 시험 유형: {random_type}")
            return question, question_audio_path, random_type
        return question, question_audio_path
    except Exception as e:
        print(f"🔥 generate_exam_question 오류: {e}")
        raise

# 시험 피드백 생성 함수 (user_pk 받아서 유저 정보 포함)
async def generate_exam_feedback(
    question: str,
    user_answer: str,
    user_pk: int,
    question_number: int,
    exam_type: str = "default",
    _model_name: str = "gemini-2.0-flash"
):
    """사용자의 답변에 대한 피드백을 생성합니다."""
    try:
        user_info = get_user_info(user_pk)
        prompt_feedbacks_template = await load_prompt_template(PROMPT_FEEDBACKS_FILE)
        context_feedback = retrieve_related_context(question, user_answer, "exam_docs", n_results=10)

        prompt_with_user = prompt_feedbacks_template.format(
            user_info=user_info_to_str(user_info),
            context=context_feedback,
            question=question,
            answer=user_answer
        )
        
        feedback = await ask_llm(
            question=question,
            answer=user_answer,
            context=context_feedback,
            prompt_template=prompt_with_user,
            __model_name=_model_name
        )
        
        print("\n\033[1;36m🔍 원본 피드백 텍스트:\033[0m")
        print("="*50)
        print(feedback)
        print("="*50)

        # 피드백 점수 계산
        score = await feedback_to_score(feedback, exam_type=exam_type, __model_name="gemini-2.0-flash")
        print(f"\033[1;35m⭐️ 피드백 점수:\033[0m {score}")

        # 사용자 진행도 업데이트
        progress_result = update_user_progress(user_pk, score)
        if progress_result["status"] == "success":
            print(f"\033[1;32m📈 진행도 업데이트 완료:\033[0m {progress_result['new_progress']}%")
            
            # 업데이트된 사용자 정보 가져오기
            updated_user_info = get_user_info(user_pk)
            if updated_user_info["status"] == "success":
                current_level = updated_user_info["user"]["past_opic_level"]
                
                # 레벨 히스토리 저장
                history_result = save_level_history(user_pk, current_level, score)
                if history_result["status"] == "success":
                    print(f"\033[1;32m📊 레벨 히스토리 저장 완료:\033[0m {current_level} - {score}")

        # DB에 저장
        save_exam_result(
            user_pk=user_pk,
            question=question,
            question_audio_path=f"audio_files/question_{user_pk}_{question_number}.mp3",
            user_answer=user_answer,
            user_answer_audio_path=f"audio_files/user_answer_{user_pk}_{question_number}.mp3",
            feedback=feedback,  # 원본 마크다운 텍스트를 그대로 저장
            score=score,  # 점수 추가
            exam_type=exam_type  # 시험 유형 추가
        )
        
        return {
            "feedback": feedback,  # 원본 마크다운 텍스트
            "score": score  # 계산된 점수
        }
    except Exception as e:
        print(f"\033[1;31m🔥 generate_exam_feedback 오류:\033[0m {e}")
        raise

def user_info_to_str(user_info):
    """
    user_info 딕셔너리를 사람이 읽기 좋은 문자열로 변환.
    필요한 필드만 포함하거나 포맷 조정 가능.
    """
    if not user_info or user_info.get('status') != 'success':
        return "User information not available."
    
    user = user_info.get('user', {})
    fields = ["past_opic_level", "goal_opic_level", "background", "occupation_or_major", "topics_of_interest"]
    info_str = ", ".join(f"{field}: {user.get(field, 'N/A')}" for field in fields)
    return info_str

if __name__ == "__main__":
    # 테스트용 코드
    import asyncio

    async def test():
        user_pk = 1  # 예시 사용자 PK
        question, question_audio_path = await generate_exam_question(user_pk)
        print(f"Generated Question: {question}")
        print(f"Generated Audio Path: {question_audio_path}")

        user_answer = "This is a sample answer."  # 예시 답변
        feedback = await generate_exam_feedback(question, user_answer, user_pk, 1)
        print(f"Generated Feedback: {feedback}")
    
    async def test_with_type():
        user_pk = 1  # 예시 사용자 PK
        question, question_audio_path, exam_type = await generate_exam_question(user_pk, with_type=True)
        print(f"Generated Question: {question}")
        print(f"Generated Audio Path: {question_audio_path}")
        print(f"Generated Exam Type: {exam_type}")

        user_answer = "This is a sample answer."
        feedback = await generate_exam_feedback(question, user_answer, user_pk, 1, exam_type=exam_type)
        print(f"Generated Feedback: {feedback}")

    async def test_speech_to_text():
        audio_path = "audio_files/test_2.mp3"
        text = await speech_to_text(audio_path)
        print(f"Generated Text: {text}")

    async def test_generate_exam_feedback():
        import time
        start = time.time()
        print(f"Start time: {start}")

        user_pk = 1  # 예시 사용자 PK
        question = "Sometimes riding the subway or bus can be uncomfortable. Have you ever had any problems related to transportation? Were there traffic jams, or did something uncomfortable happen? What was the problem, and How did you deal with the situation?"
        audio_path = "audio_files/test_3.mp3"
        user_answer = await speech_to_text(audio_path)
        question_number = 1
        exam_type = "default"
        # model_name = "gemini-2.0-flash"
        # model_name = "gemini-2.5-flash-preview-05-20"
        model_name = "gemini-2.5-pro-preview-05-06"
        feedback = await generate_exam_feedback(
            question=question,
            user_answer=user_answer,
            user_pk=user_pk,
            question_number=question_number,
            exam_type=exam_type,
            _model_name=model_name
        )
        print(f"Generated Feedback: {feedback['feedback']}")
        print(f"Feedback Score: {feedback['score']}")

        end = time.time()
        print(f"End time: {end}")
        print(f"Total time taken: {end - start} seconds")


    # asyncio.run(test())
    # asyncio.run(test_with_type())
    asyncio.run(test_speech_to_text())
    # asyncio.run(test_generate_exam_feedback())
