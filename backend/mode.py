# mode.py
import random
from db_utils.vocab_idiom_db_utils import get_vocab_items

def generate_question():
    """
    DB에서 랜덤으로 단어/숙어를 뽑아 문제로 출제합니다.
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

def check_answer(vocab_id: int, user_answer: str):
    """
    사용자의 답변이 정답(뜻)과 일치하는지 확인하고 피드백을 반환합니다.
    """
    vocab_list = get_vocab_items()
    vocab = next((v for v in vocab_list if v["id"] == vocab_id), None)
    if not vocab:
        return {"correct": False, "feedback": "문제를 찾을 수 없습니다."}
    correct = user_answer.strip() == vocab["meaning"].strip()
    feedback = "정답입니다!" if correct else f"오답입니다. 정답: {vocab['meaning']}"
    return {"correct": correct, "feedback": feedback} 