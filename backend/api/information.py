# api/information.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from information_mode import get_learning_tips, get_random_feedback_examples, get_related_feedback

router = APIRouter(tags=["Information Mode"]) 

class LearningTipResponse(BaseModel):
    tip: str

class FeedbackExampleResponse(BaseModel):
    example: str

@router.get("/info/tips", response_model=LearningTipResponse)
async def api_get_learning_tips(query: str):
    """학습 팁 관련 정보를 검색합니다."""
    tip = get_learning_tips(query)
    return {"tip": tip}

@router.get("/info/feedback/random", response_model=FeedbackExampleResponse)
async def api_get_random_feedback_examples():
    """랜덤한 피드백 예시를 검색합니다."""
    example = get_random_feedback_examples()
    return {"example": example}

@router.get("/info/feedback/related", response_model=FeedbackExampleResponse)
async def api_get_related_feedback(question: str, answer: str):
    """특정 질문과 답변에 관련된 피드백을 검색합니다."""
    example = get_related_feedback(question, answer)
    return {"example": example}