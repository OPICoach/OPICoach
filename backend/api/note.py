from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from db_utils.learning_note_db_utils import get_learning_notes, delete_learning_note, save_learning_note
from learning_mode import get_learning_session
from note_mode import generate_learning_note

router = APIRouter(tags=["Note Mode"])

class CreateNoteRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    session_pk: int = Field(..., description="학습 세션 PK")
    title: str = Field(..., description="노트 제목")

class NoteResponse(BaseModel):
    success: bool = Field(..., description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: Optional[dict] = Field(None, description="노트 데이터")
    note_pk: Optional[int] = Field(None, description="노트 PK")

class GetNoteRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    note_pk: Optional[int] = Field(None, description="학습 노트 PK")

@router.post("/notes/create", response_model=NoteResponse)
async def api_create_learning_note(request: CreateNoteRequest):
    """새로운 학습 노트를 생성합니다."""
    try:
        # 세션 존재 여부 확인
        session = await get_learning_session(request.user_pk, request.session_pk)
        if not session:
            return {
                "success": False,
                "message": "해당 학습 세션을 찾을 수 없습니다.",
                "data": None,
                "note_pk": None
            }

        # 노트 생성 및 저장
        result = await generate_learning_note(
            user_pk=request.user_pk,
            session_pk=request.session_pk,
            title=request.title
        )
        if not result:
            return {
                "success": False,
                "message": "학습 노트 생성에 실패했습니다.",
                "data": None,
                "note_pk": None
            }
            
        # 생성된 노트 정보 조회
        note_data = get_learning_notes(request.user_pk, str(result))
        response = {
            "success": True,
            "message": "학습 노트가 성공적으로 생성되었습니다.",
            "data": note_data,
            "note_pk": result
        }
        return response
    except Exception as e:
        print(f"Error in /notes/create: {e}")
        return {
            "success": False,
            "message": f"학습 노트 생성 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "note_pk": None
        }

@router.post("/notes/get", response_model=NoteResponse)
async def api_get_learning_notes(request: GetNoteRequest):
    """학습 노트를 조회합니다."""
    try:
        notes = get_learning_notes(request.user_pk, request.note_pk)
        return {
            "success": True,
            "message": "학습 노트 조회가 완료되었습니다.",
            "data": {"notes": notes} if not request.note_pk else notes,
            "note_pk": request.note_pk
        }
    except Exception as e:
        print(f"Error in /notes/get: {e}")
        return {
            "success": False,
            "message": f"학습 노트 조회 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "note_pk": request.note_pk
        }

@router.post("/notes/delete", response_model=NoteResponse)
async def api_delete_learning_note(request: GetNoteRequest):
    """특정 학습 노트를 삭제합니다."""
    try:
        if not request.note_pk:
            return {
                "success": False,
                "message": "노트 PK가 필요합니다.",
                "data": None,
                "note_pk": None
            }
            
        result = delete_learning_note(request.user_pk, request.note_pk)
        return {
            "success": result,
            "message": "학습 노트가 성공적으로 삭제되었습니다." if result else "학습 노트 삭제에 실패했습니다.",
            "data": None,
            "note_pk": request.note_pk
        }
    except Exception as e:
        print(f"Error in /notes/delete: {e}")
        return {
            "success": False,
            "message": f"학습 노트 삭제 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "note_pk": request.note_pk
        } 