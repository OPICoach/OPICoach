# utils.py
import os
import random
import asyncio

# 출력 후처리 (이모티콘 제거)
def postprocess_output(text):
    if not isinstance(text, str):
        return ""  # 입력이 문자열이 아니면 빈 문자열 반환
    cleaned_text = ''.join(char for char in text if char.isalnum() or char.isspace() or char in ['.', ',', '?', '!'])
    return cleaned_text.replace("*", "").strip()

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
