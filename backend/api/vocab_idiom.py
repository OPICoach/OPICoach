from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from vocab_idiom_mode import generate_vocab_question, check_vocab_answer, get_vocab_history

router = APIRouter(tags=["Vocab/Idiom Mode"])

class VocabQuestionResponse(BaseModel):
    id: int
    word: str
    # meaning은 문제 출제 시 숨길 수 있음

class VocabFeedbackRequest(BaseModel):
    vocab_id: int = Field(..., description="문제의 vocab id")
    user_answer: str = Field(..., description="사용자의 답변")
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")

class VocabFeedbackResponse(BaseModel):
    correct: bool
    feedback: str

class VocabHistoryItem(BaseModel):
    id: int
    word: str
    meaning: str

class VocabHistoryResponse(BaseModel):
    history: list[VocabHistoryItem]

@router.get("/question", response_model=VocabQuestionResponse)
async def api_generate_vocab_question(user_pk: int = Query(..., description="사용자 PK (DB 기본키)")):
    try:
        vocab = generate_vocab_question(user_pk)
        if not vocab:
            raise HTTPException(status_code=404, detail="단어 문제가 없습니다.")
        return {"id": vocab["id"], "word": vocab["word"]}
    except Exception as e:
        print(f"Error in /api/vocab/question: {e}")
        raise HTTPException(status_code=500, detail="단어 문제 생성 중 오류가 발생했습니다.")

@router.post("/feedback", response_model=VocabFeedbackResponse)
async def api_check_vocab_answer(request: VocabFeedbackRequest):
    try:
        result = check_vocab_answer(request.user_pk, request.vocab_id, request.user_answer)
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