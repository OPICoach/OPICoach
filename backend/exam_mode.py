# exam_mode.py
import os
import re
import json
from utils import ask_llm, load_prompt_template
from db_utils.chroma_db_utils import retrieve_random_context, retrieve_related_context
from db_utils.user_db_utils import get_user_info
from db_utils.exam_db_utils import save_exam_result


# model_name = "gemini-2.0-flash"
model_name = "gemini-2.5-pro-preview-05-06"
PROMPT_MAKEEXAM_FILE = "./prompt/prompt_makeexam.txt"
PROMPT_FEEDBACKS_FILE = "./prompt/prompt_feedbacks.txt"


# 시험 문제 생성 함수 (user_pk 받아서 유저 정보 포함)
async def generate_exam_question(user_pk: int):
    """LLM을 사용하여 시험 문제를 생성하고 반환합니다."""
    try:
        user_info = get_user_info(user_pk)  # DB에서 유저 정보 조회 (dict형태라고 가정)
        prompt_makeexam_template = await load_prompt_template(PROMPT_MAKEEXAM_FILE)
        context_question = retrieve_random_context("exam_docs", n_results=10)

        prompt_with_user = prompt_makeexam_template.format(
            user_info=user_info_to_str(user_info),
            context=context_question,
            question="",
            answer=""
        )
        question = await ask_llm("", "", context_question, prompt_with_user, __model_name="gemini-2.0-flash")
        print(f"\033[1;34m❓ 생성된 질문:\033[0m {question}")
        return question
    except Exception as e:
        print(f"\033[1;31m🔥 generate_exam_question 오류:\033[0m {e}")
        raise

# 시험 피드백 생성 함수 (user_pk 받아서 유저 정보 포함)
async def generate_exam_feedback(user_pk: int, question: str, user_answer: str):
    """주어진 질문과 사용자의 답변에 대한 피드백을 생성하고 저장한 후 반환합니다."""
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
        feedback = await ask_llm(question, user_answer, context_feedback, prompt_with_user, __model_name="gemini-2.5-pro-preview-05-06")
        feedback_json = feedback_text_to_json(feedback)

        print(f"\n\033[1;33m🔧 생성된 피드백:\033[0m\n{feedback}")
        print(f"\n\033[1;32m🔧 후처리된 피드백 (JSON):\033[0m\n{feedback_json}")

        # DB에 저장
        save_exam_result(
            user_pk=user_pk,
            question=question,
            user_answer=user_answer,
            feedback={
                "Good Point": feedback_json.get("Good_Point", ""),
                "Bad Point": feedback_json.get("Bad_Point", ""),
                "Overall Feedback": feedback_json.get("Overall_Feedback", ""),
                "Teachers Answer": feedback_json.get("Teachers_Answer", "")
            }
        )

        return feedback_json
    except Exception as e:
        print(f"\033[1;31m🔥 generate_exam_feedback 오류:\033[0m {e}")
        raise


def user_info_to_str(user_info):
    """
    user_info 딕셔너리를 사람이 읽기 좋은 문자열로 변환.
    필요한 필드만 포함하거나 포맷 조정 가능.
    """
    if not user_info:
        return "User information not available."
    # 예시: 주요 정보만 뽑아서 문자열 생성
    fields = ["past_opic_level", "goal_opic_level", "background", "occupation_or_major", "topics_of_interest"]
    info_str = ", ".join(f"{field}: {user_info.get(field, 'N/A')}" for field in fields)
    return info_str

def feedback_text_to_json(feedback_text):
    sections = ["Good Point", "Bad Point", "Overall Feedback", "Teachers Answer"]  # 'Teacher's Answer' → 'Teachers Answer'
    # 콜론 없으니까 `:` 삭제, 각 섹션이 줄바꿈 또는 섹션 이름 앞에 있는지 체크
    pattern = r"(?P<section>" + "|".join(sections) + r")\s*\n(?P<content>.*?)(?=\n(?:Good Point|Bad Point|Overall Feedback|Teachers Answer)\s*\n|\Z)"
    matches = re.finditer(pattern, feedback_text, re.DOTALL)

    result = {}
    key_mapping = {
        "Good Point": "Good_Point",
        "Bad Point": "Bad_Point",
        "Overall Feedback": "Overall_Feedback",
        "Teachers Answer": "Teachers_Answer"
    }
    for match in matches:
        key = match.group("section")
        new_key = key_mapping.get(key, key)
        value = match.group("content").strip().replace('\n', ' ')
        result[new_key] = value
    
    return result
