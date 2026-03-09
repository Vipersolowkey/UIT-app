from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, List

from app.services.search_agent import search_agent

router = APIRouter(prefix="/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    query: str
    results: List[Any]

@router.post("", response_model=SearchResponse)
def search(req: SearchRequest):
    results = search_agent(req.query)
    return SearchResponse(query=req.query, results=results)