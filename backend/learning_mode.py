import os
import json
from typing import List, Dict, Optional
from utils import load_prompt_template, ask_llm
from db_utils.chroma_db_utils import retrieve_context as rag_retrieve_context
from db_utils.chatlog_db_utils import load_chat_history, save_chat_history
from db_utils.user_db_utils import get_user_info
from db_utils.learning_session_db_utils import get_session_info, create_learning_session



# model_name = "gemini-2.0-flash"
model_name = "gemini-2.5-pro-preview-05-06"
PROMPT_FILE = "./prompt/prompt_learning.txt"
LEARNING_COLLECTION_NAME = "learning_docs"


def user_info_to_str(user_info):
    if not user_info:
        return "User information not available."
    fields = ["past_opic_level", "goal_opic_level", "background", "occupation_or_major", "topics_of_interest"]
    info_str = ", ".join(f"{field}: {user_info.get(field, 'N/A')}" for field in fields)
    return info_str

async def generate_learning_response(user_pk: int, question: str, session_pk: int, _model_name: str = model_name):
    # DB에서 해당 user_pk, session_pk에 해당하는 채팅 기록을 불러옴
    if callable(getattr(load_chat_history, "__await__", None)):
        loaded_history = await load_chat_history(user_pk, session_pk)
    else:
        loaded_history = load_chat_history(user_pk, session_pk)

    # DB에 기록 없으면 빈 리스트
    current_chat_to_llm = list(loaded_history) if loaded_history else []

    print(f"Using loaded_history from DB for LLM. Length: {len(current_chat_to_llm)}")

    prompt_template_raw = await load_prompt_template(PROMPT_FILE)

    try:
        user_info = get_user_info(user_pk)
        user_info_str = user_info_to_str(user_info)

        context = rag_retrieve_context(question, LEARNING_COLLECTION_NAME)

        prompt_template = prompt_template_raw.format(
            context=context,
            question=question,
            answer="",
            user_info=user_info_str
        )

        answer = await ask_llm(question, "", context, prompt_template, history=current_chat_to_llm, __model_name=_model_name)
        print(f"\n🧠 생성된 답변:\n{answer}")

        # 새로운 메시지 생성
        new_messages = [
            {"role": "user", "content": question},
            {"role": "assistant", "content": answer}
        ]

        # 기존 메시지와 새로운 메시지 합치기
        updated_messages = current_chat_to_llm + new_messages

        # DB에 저장
        if callable(getattr(save_chat_history, "__await__", None)):
            await save_chat_history(user_pk, session_pk, updated_messages)
        else:
            save_chat_history(user_pk, session_pk, updated_messages)

        print(f"Returning updated history length: {len(updated_messages)}")

        return answer, updated_messages

    except Exception as e:
        print(f"\n⚠️ 학습 응답 생성 오류: {e}")
        return f"오류가 발생했습니다: {e}", loaded_history if loaded_history else []

async def generate_learning_session(user_pk: int, title: str = None) -> Dict:
    """학습 세션을 생성합니다."""
    try:
        # 세션 저장
        session_pk = create_learning_session(user_pk, title)
        if not session_pk:
            raise ValueError("세션 저장에 실패했습니다.")

        # 생성된 세션 정보 조회
        session = get_session_info(user_pk, session_pk)
        if not session:
            raise ValueError("생성된 세션 정보를 찾을 수 없습니다.")

        return session
    except Exception as e:
        print(f"Error creating learning session: {e}")
        raise

async def get_learning_session(user_pk: int, session_pk: int) -> Optional[Dict]:
    """특정 학습 세션의 정보를 가져옵니다."""
    try:
        # 세션 정보 조회 (chat_history 포함)
        session = get_session_info(user_pk, session_pk)
        if not session:
            return None
            
        return {
            "id": session_pk,
            "title": session.get("title", ""),
            "chat_history": session.get("chat_history", [])
        }
    except Exception as e:
        print(f"Error in get_learning_session: {e}")
        return None
