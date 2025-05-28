# api/exam.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from exam_mode import generate_exam_question, generate_exam_feedback

router = APIRouter(tags=["Exam Mode"]) 

class ExamFeedbackRequest(BaseModel):
    question: str = Field(..., description="LLM이 생성한 질문")
    user_answer: str = Field(..., description="사용자의 답변")
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")

class ExamFeedbackResponse(BaseModel):
    feedback: str

class ExamQuestionResponse(BaseModel):
    question: str

@router.get("/question", response_model=ExamQuestionResponse)
async def api_generate_exam_question(user_pk: int = Query(..., description="사용자 PK (DB 기본키)")):
    try:
        question = await generate_exam_question(user_pk)
        return {"question": question}
    except Exception as e:
        print(f"Error in /api/exam/question: {e}")
        raise HTTPException(status_code=500, detail="시험 문제 생성 중 오류가 발생했습니다.")

@router.post("/feedback", response_model=ExamFeedbackResponse)
async def api_generate_exam_feedback(request: ExamFeedbackRequest):
    try:
        feedback = await generate_exam_feedback(request.user_pk, request.question, request.user_answer)
        return {"feedback": feedback}
    except Exception as e:
        print(f"Error in /api/exam/feedback: {e}")
        raise HTTPException(status_code=500, detail="피드백 생성 중 오류가 발생했습니다.")
