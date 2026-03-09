from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional, List, Dict, Any
import httpx
import os

from app.services.question_bank import load_all_questions

router = APIRouter(prefix="/judge", tags=["judge"])

JUDGE0_URL = os.getenv("JUDGE0_URL", "http://localhost:2358").rstrip("/")
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "").strip()

# map language -> Judge0 language_id (có thể đổi theo image Judge0 bạn chạy)
LANG_MAP = {
    "cpp": 54,    # C++ (GCC 9+ thường là 54)
    "python": 71  # Python 3
}

class JudgeSubmitRequest(BaseModel):
    problemId: str
    language: str
    sourceCode: str
    mode: Literal["sample", "tests"] = "tests"

class JudgeCaseResult(BaseModel):
    ok: bool
    stdout: str = ""
    expected: str = ""
    stderr: str = ""
    status: str = ""

class JudgeSubmitResponse(BaseModel):
    status: str
    passed: int
    total: int
    results: List[JudgeCaseResult]


def _find_problem(problem_id: str) -> Optional[Dict[str, Any]]:
    for q in load_all_questions():
        if q.get("id") == problem_id and q.get("type") == "coding":
            return q
    return None


async def _judge_one(client: httpx.AsyncClient, language_id: int, source: str, stdin: str) -> Dict[str, Any]:
    payload = {
        "language_id": language_id,
        "source_code": source,
        "stdin": stdin,
        # "cpu_time_limit": 2,  # optional
    }
    headers = {}
    if JUDGE0_API_KEY:
        headers["X-Auth-Token"] = JUDGE0_API_KEY

    # tạo submission
    r = await client.post(f"{JUDGE0_URL}/submissions/?base64_encoded=false&wait=true", json=payload, headers=headers, timeout=60)
    r.raise_for_status()
    return r.json()


@router.post("/submit", response_model=JudgeSubmitResponse)
async def submit(req: JudgeSubmitRequest):
    prob = _find_problem(req.problemId)
    if not prob:
        raise HTTPException(status_code=404, detail="problem not found")

    lang = req.language.strip().lower()
    if lang not in LANG_MAP:
        raise HTTPException(status_code=400, detail=f"unsupported language: {lang}")

    cases = prob.get("samples") if req.mode == "sample" else prob.get("tests")
    if not cases:
        raise HTTPException(status_code=400, detail="no testcases found in problem")

    language_id = LANG_MAP[lang]

    results: List[JudgeCaseResult] = []
    passed = 0

    async with httpx.AsyncClient() as client:
        for tc in cases:
            inp = tc.get("input", "")
            exp = tc.get("output", "")

            try:
                out = await _judge_one(client, language_id, req.sourceCode, inp)
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Judge0 error: {e}")

            stdout = (out.get("stdout") or "")
            stderr = (out.get("stderr") or "")
            status_desc = (out.get("status") or {}).get("description", "")

            # compare output (trim nhẹ)
            ok = stdout.strip() == str(exp).strip() and status_desc.lower() in ("accepted", "finished", "ok")
            if ok:
                passed += 1

            results.append(JudgeCaseResult(
                ok=ok,
                stdout=stdout,
                expected=str(exp),
                stderr=stderr,
                status=status_desc,
            ))

    overall = "Accepted" if passed == len(results) else "Wrong Answer"
    return JudgeSubmitResponse(status=overall, passed=passed, total=len(results), results=results)