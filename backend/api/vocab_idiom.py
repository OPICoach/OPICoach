from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from vocab_idiom_mode import get_vocab_items, check_vocab_answer, get_vocab_history
import random

router = APIRouter(tags=["Vocab/Idiom Mode"])

class VocabQuestionResponse(BaseModel):
    id: int
    word: str
    meaning: str
    # meaning은 문제 출제 시 숨길 수 있음

class VocabFeedbackRequest(BaseModel):
    vocab_id: int = Field(..., description="문제의 vocab id")
    user_answer: str = Field(..., description="사용자의 답변")

class VocabFeedbackResponse(BaseModel):
    correct: bool
    feedback: str

class VocabHistoryItem(BaseModel):
    id: int
    word: str
    meaning: str

class VocabHistoryResponse(BaseModel):
    history: list[VocabHistoryItem]

@router.get("/question", response_model=list[VocabQuestionResponse])
async def api_generate_vocab_questions(user_pk: int = Query(..., description="사용자 PK (DB 기본키)")):
    try:
        vocab_list = get_vocab_items()
        if len(vocab_list) < 4:
            raise HTTPException(status_code=400, detail="단어가 4개 이상 필요합니다.")
        choices = random.sample(vocab_list, 4)
        return choices
    except Exception as e:
        print(f"Error in /api/vocab/question: {e}")
        raise HTTPException(status_code=500, detail="단어 문제 생성 중 오류가 발생했습니다.")

@router.post("/feedback", response_model=VocabFeedbackResponse)
async def api_check_vocab_answer(request: VocabFeedbackRequest):
    try:
        result = check_vocab_answer(1, request.vocab_id, request.user_answer)  # user_pk는 사용하지 않음
        return result
    except Exception as e:
        print(f"Error in /api/vocab/feedback: {e}")
        raise HTTPException(status_code=500, detail="피드백 생성 중 오류가 발생했습니다.")

@router.get("/history", response_model=VocabHistoryResponse)
async def api_get_vocab_history(user_pk: int = Query(..., description="사용자 PK (DB 기본키)")):
    try:
        history = get_vocab_history(user_pk)
        return {"history": history}
    except Exception as e:
        print(f"Error in /api/vocab/history: {e}")
        raise HTTPException(status_code=500, detail="학습 기록 불러오기 중 오류가 발생했습니다.") 