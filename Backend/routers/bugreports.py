from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import os, json

router = APIRouter()

def get_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")
    return Groq(api_key=api_key)

class BugReportRequest(BaseModel):
    title: str
    description: str
    environment: Optional[str] = ""
    browser: Optional[str] = ""
    actual_behavior: Optional[str] = ""

SYSTEM_PROMPT = """You are a QA engineer writing professional bug reports.
Return ONLY a valid JSON object with no markdown, no code blocks, no preamble.
Fields: summary, severity (Critical/High/Medium/Low), priority (P1/P2/P3/P4),
preconditions, steps_to_reproduce (array of strings), expected_result, actual_result,
environment, workaround."""

@router.post("/generate")
async def generate_bug_report(request: BugReportRequest):
    prompt = f"""Generate bug report for:
Title: {request.title}
Description: {request.description}
Environment: {request.environment}
Browser: {request.browser}
Actual Behavior: {request.actual_behavior}"""
    try:
        client = get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content.strip())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
