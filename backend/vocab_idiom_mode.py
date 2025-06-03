# vocab_idiom_mode.py
from db_utils.vocab_idiom_db_utils import get_vocab_items, save_vocab_item
from db_utils.user_db_utils import get_user_info
from db_utils.vocab_idiom_db_utils import get_review_items
import random

def generate_vocab_question(user_pk: int):
    """
    DB에서 랜덤으로 단어/숙어를 뽑아 문제로 출제합니다.
    (추후 LLM 활용 가능)
    """
    vocab_list = get_vocab_items()
    if not vocab_list:
        return None
    vocab = random.choice(vocab_list)
    return {
        "id": vocab["id"],
        "word": vocab["word"],
        "meaning": vocab["meaning"]  # 실제 문제에서는 meaning을 숨길 수 있음
    }

def check_vocab_answer(user_pk: int, vocab_id: int, user_answer: str):
    """
    사용자의 답변이 정답(뜻)과 일치하는지 확인하고 피드백을 반환합니다.
    """
    vocab_list = get_vocab_items()
    vocab = next((v for v in vocab_list if v["id"] == vocab_id), None)
    if not vocab:
        return {"correct": False, "feedback": "문제를 찾을 수 없습니다."}
    correct = user_answer.strip() == vocab["meaning"].strip()
    feedback = "정답입니다!" if correct else f"오답입니다. 정답: {vocab['meaning']}"
    # (추후 DB에 학습 결과 저장 가능)
    return {"correct": correct, "feedback": feedback}

def get_vocab_history(user_pk: int):
    """
    (예시) 사용자의 복습이 필요한 단어/숙어 목록을 반환합니다.
    """
    return get_review_items(user_pk) 