import os
from utils import load_prompt_template, ask_llm
from db_utils.chatlog_db_utils import load_chat_history
from db_utils.learning_note_db_utils import save_learning_note, get_learning_notes, delete_learning_note
from typing import List, Optional, Dict


model_name = "gemini-2.5-pro-preview-05-06"
LEARNING_NOTE_PROMPT_FILE = "./prompt/prompt_learning_note.txt"


async def generate_learning_note(*, user_pk: int, session_pk: int, title: str = None) -> Optional[int]:
    """채팅 기록을 바탕으로 학습 노트를 생성합니다."""
    try:
        # 채팅 기록 로드
        if callable(getattr(load_chat_history, "__await__", None)):
            chat_history = await load_chat_history(user_pk, session_pk)
        else:
            chat_history = load_chat_history(user_pk, session_pk)

        if not chat_history:
            return None

        # 채팅 기록을 문자열로 변환
        chat_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])

        # 프롬프트 템플릿 로드
        prompt_template = await load_prompt_template(LEARNING_NOTE_PROMPT_FILE)

        # LLM을 통해 노트 생성
        note_content = await ask_llm("", "", chat_text, prompt_template, __model_name="gemini-2.5-pro-preview-05-06")
        
        if not note_content or note_content == "채팅 기록이 없습니다.":
            return None

        # 노트 저장
        note_pk = save_learning_note(user_pk, title, note_content, session_pk)
        return note_pk

    except Exception as e:
        print(f"\n⚠️ 학습 노트 생성 오류: {e}")
        return None 