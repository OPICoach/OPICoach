# utils.py
import os
import random
import asyncio
import json
from openai import AsyncOpenAI
from pydantic import BaseModel, Field, ValidationError
from dotenv import load_dotenv
load_dotenv()

# 출력 후처리 (이모티콘 제거)
def postprocess_output(text):
    # if not isinstance(text, str):
    #     return ""  # 입력이 문자열이 아니면 빈 문자열 반환
    # cleaned_text = ''.join(char for char in text if char.isalnum() or char.isspace() or char in ['.', ',', '?', '!'])
    # return cleaned_text.replace("*", "").strip()

    # \n과 \\n을 <br>로 변환
    text = text.replace("\\n", "<br>").replace("\n", "<br>")

    return text if text else ""

# 프롬프트 불러오기 (비동기)
async def load_prompt_template(file_path, user_info: dict = None):
    try:
        loop = asyncio.get_running_loop()
        content = await loop.run_in_executor(None, _read_file, file_path)
        if user_info:
            user_info_str = "\n".join(f"{key}: {value}" for key, value in user_info.items())
            content = content.replace("{user_info}", user_info_str)
        return content
    except FileNotFoundError:
        print(f"\033[1;31m🔥 프롬프트 템플릿 파일({file_path})을 찾을 수 없습니다.\033[0m")
        raise
    except Exception as e:
        print(f"\033[1;31m🔥 프롬프트 템플릿 파일({file_path}) 로딩 오류:\033[0m {e}")
        raise

def _read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()


# # OpenAI API 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_BASE_URL = os.getenv("OPENAI_API_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/")

# openai_client = AsyncOpenAI(
#     api_key=OPENAI_API_KEY,
#     base_url=OPENAI_API_BASE_URL
# )
# Gemini(OpenAI 호환 API) 클라이언트
openai_client = AsyncOpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/"
)

async def ask_llm(question, answer, context, prompt_template, history=None, __model_name="gemini-2.0-flash"):
    prompt = prompt_template.format(context=context, question=question, answer=answer)
    messages = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": prompt})

    try:
        response = await openai_client.chat.completions.create(
            model=__model_name,
            messages=messages,
        )

        raw_content = response.choices[0].message.content
        return postprocess_output(raw_content)
    except Exception as e:
        print(f"\033[1;31m🔥 ask_llm 오류:\033[0m {e}")
        return ""

# 시험 유형 정의
exam_types = ["self_introduction", "description", "routine", "comparison", "past_experience", "role_play", "advanced_qustion"]
"""
exam_types_score = {
    "self_introduction": (-3, 1),
    "description": (-2, 2),
    "routine": (-2, 2),
    "comparison": (-2, 2),
    "past_experience": (-2, 3),
    "role_play": (-2, 4),
    "advanced_qustion": (-1, 5),
    "default": (-5, 5)
}
"""
exam_types_score = {
    "self_introduction": (30, 100),
    "description": (20, 20),
    "routine": (20, 30),
    "comparison": (20, 30),
    "past_experience": (20, 30),
    "role_play": (20, 40),
    "advanced_qustion": (20, 50),
    "default": (50, 70)
}


class ScoreResponseModel(BaseModel):
    score: int = Field(ge=20, le=100, description="피드백에 대한 점수, -5에서 5 사이의 정수")

async def feedback_to_score(feedback, exam_type="default", __model_name="gemini-2.0-flash"):
    min_score, max_score = exam_types_score.get(exam_type, (20, 100))
    prompt = (
        f"다음 피드백에 대한 점수를 {min_score}에서 {max_score} 사이의 정수로 평가해주세요. "
        f"응답은 반드시 JSON 형식이어야 하며, 'score'라는 키를 가져야 합니다. 예: {{\"score\": 3}}\n\n"
        f"피드백: {feedback}\n\n"
        f"JSON 응답:"
    )
    messages = []
    messages.append({"role": "user", "content": prompt})

    try:
        response = await openai_client.chat.completions.create(
            model=__model_name,
            messages=messages,
            response_format={"type": "json_object"} # OpenAI JSON 모드 사용
        )
        
        if response.choices and response.choices[0].message and response.choices[0].message.content:
            raw_content = response.choices[0].message.content
            try:
                # Pydantic 모델로 데이터 검증 및 파싱
                validated_data = ScoreResponseModel.model_validate_json(raw_content)
                return validated_data.score
            except ValidationError as ve: # JSON 파싱 오류 및 데이터 유효성 검사 오류 처리
                print(f"\033[1;31m🔥 feedback_to_score: 데이터 검증/파싱 오류: {ve}\033[0m")
                print(f"원본 내용: {raw_content}")
                return 0
        else:
            print(f"\033[1;33m⚠️ feedback_to_score: LLM으로부터 유효한 응답을 받지 못했습니다. 0을 반환합니다.\033[0m")
            return 0
    except Exception as e_api: # API 호출 자체의 오류 등 기타 예외
        print(f"\033[1;31m🔥 feedback_to_score API 호출 중 오류: {e_api}\033[0m")
        return 0

if __name__ == "__main__":
    import asyncio

    # ask_llm_score 함수 테스트
    feedback_to_test = "이것은 테스트 피드백입니다. 점수를 매겨주세요."
    print(f"테스트 피드백: {feedback_to_test}")
    
    # ask_llm_score 함수 직접 호출
    score_result = asyncio.run(feedback_to_score(feedback_to_test))
    print(f"LLM 평가 점수: {score_result}")