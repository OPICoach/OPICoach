# api/learning.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field

from learning_mode import generate_learning_response

router = APIRouter(tags=["Learning Mode"]) 

class ChatMessage(BaseModel):
    role: str = Field(..., description="메시지 역할 ('user' 또는 'assistant')")
    content: str = Field(..., description="메시지 내용")

class LearningResponseRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")  # 여기에 추가
    session_id: str = Field(..., description="사용자 세션 ID")
    question: str = Field(..., description="사용자의 질문")
    chat_history: Optional[List[ChatMessage]] = Field(None, description="이전 대화 기록 (선택 사항)")

class LearningResponseResponse(BaseModel):
    answer: str
    chat_history: List[ChatMessage]

@router.post("/response", response_model=LearningResponseResponse)
async def api_generate_learning_response(request: LearningResponseRequest):
    try:
        answer, updated_history = await generate_learning_response(
            user_id=request.user_pk,  # 하드코딩 제거 후 여기에 user_pk 넣음
            question=request.question,
            session_id=request.session_id,
            chat_history_from_request=[msg.dict() for msg in request.chat_history] if request.chat_history else None
        )
        return {"answer": answer, "chat_history": updated_history}
    except Exception as e:
        print(f"Error in /learning/response: {e}")
        raise HTTPException(status_code=500, detail="학습 응답 생성 중 오류가 발생했습니다.")
