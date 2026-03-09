from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.coding_bank import list_problems, get_problem

router = APIRouter(prefix="/coding", tags=["coding"])

class CodingListItem(BaseModel):
    id: str
    title: str
    difficulty: str = "easy"
    tags: List[str] = []

class CodingListResponse(BaseModel):
    items: List[CodingListItem]

@router.get("/problems", response_model=CodingListResponse)
def problems(
    q: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
):
    raw = list_problems(q=q, difficulty=difficulty, tag=tag)
    items = []
    for x in raw:
        items.append(CodingListItem(
            id=x.get("id",""),
            title=x.get("title",""),
            difficulty=x.get("difficulty","easy"),
            tags=x.get("tags") or [],
        ))
    return CodingListResponse(items=items)

@router.get("/problem/{problem_id}")
def problem_detail(problem_id: str) -> Dict[str, Any]:
    p = get_problem(problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="problem not found")
    # trả full để FE render leetcode-like
    return p