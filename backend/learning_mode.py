import os
from openai import AsyncOpenAI
from utils import load_prompt_template, postprocess_output
from db_utils.chroma_db_utils import retrieve_context as rag_retrieve_context
from db_utils.chatlog_db_utils import load_chat_history, save_chat_history
from db_utils.user_db_utils import get_user_info  # 유저 정보 조회 함수 임포트

openai_client = AsyncOpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/"
)
model_name = "gemini-2.5-pro-preview-05-06"
PROMPT_FILE = "./prompt/prompt_learning.txt"
LEARNING_COLLECTION_NAME = "learning_docs"

async def ask_llm(question, answer, context, prompt_template, history=None):
    prompt = prompt_template.format(context=context, question=question, answer=answer)
    messages = history[:] if history else []
    messages.append({"role": "user", "content": prompt})

    response = await openai_client.chat.completions.create(
        model=model_name,
        messages=messages,
    )
    raw_content = response.choices[0].message.content
    raw_output = raw_content.strip() if raw_content else ""
    return postprocess_output(raw_output)

def user_info_to_str(user_info):
    if not user_info:
        return "User information not available."
    fields = ["past_opic_level", "goal_opic_level", "background", "occupation_or_major", "topics_of_interest"]
    info_str = ", ".join(f"{field}: {user_info.get(field, 'N/A')}" for field in fields)
    return info_str

async def generate_learning_response(user_id: int, question: str, session_id: str, chat_history_from_request: list = None):
    loaded_history = await load_chat_history(session_id) if callable(getattr(load_chat_history, "__await__", None)) else load_chat_history(session_id)

    if chat_history_from_request is None:
        current_chat_to_llm = list(loaded_history)
        print(f"chat_history_from_request is None. Using loaded_history from DB for LLM. Length: {len(current_chat_to_llm)}")
    else:
        current_chat_to_llm = list(chat_history_from_request)
        print(f"Using chat_history_from_request for LLM. Length: {len(current_chat_to_llm)}")

    prompt_template_raw = await load_prompt_template(PROMPT_FILE)  # await 유지

    try:
        user_info = get_user_info(user_id)  # 유저 정보 조회
        user_info_str = user_info_to_str(user_info)

        context = rag_retrieve_context(question, LEARNING_COLLECTION_NAME)

        # 프롬프트에 user_info 문자열을 추가해 포맷
        prompt_template = prompt_template_raw.format(
            context=context,
            question=question,
            answer="",
            user_info=user_info_str
        )

        answer = await ask_llm(question, "", context, prompt_template, current_chat_to_llm)
        print(f"\n🧠 생성된 답변:\n{answer}")

        current_turn_for_db = [
            {"role": "user", "content": question},
            {"role": "assistant", "content": answer}
        ]

        if callable(getattr(save_chat_history, "__await__", None)):
            await save_chat_history(user_id, session_id, current_turn_for_db)
        else:
            save_chat_history(user_id, session_id, current_turn_for_db)

        if chat_history_from_request is None:
            updated_history_for_frontend = loaded_history + current_turn_for_db
            print(f"Returning history based on DB: loaded_history ({len(loaded_history)}) + current_turn ({len(current_turn_for_db)}) = {len(updated_history_for_frontend)}")
        else:
            updated_history_for_frontend = chat_history_from_request + current_turn_for_db
            print(f"Returning history based on request: chat_history_from_request ({len(chat_history_from_request)}) + current_turn ({len(current_turn_for_db)}) = {len(updated_history_for_frontend)}")

        return answer, updated_history_for_frontend

    except Exception as e:
        print(f"\n⚠️ 학습 응답 생성 오류: {e}")
        return f"오류가 발생했습니다: {e}", loaded_history
