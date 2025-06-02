# utils.py
import os
import random
import asyncio
from openai import AsyncOpenAI
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