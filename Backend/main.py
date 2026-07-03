from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
for env_file in [os.path.join(BASE_DIR, ".env"), os.path.join(os.getcwd(), ".env")]:
    if os.path.exists(env_file):
        load_dotenv(env_file, override=True)
        break

FALLBACK_KEY = "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"
if not os.getenv("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = FALLBACK_KEY

from routers import testcases, automation, bugreports

app = FastAPI(title="QA Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testcases.router, prefix="/api/testcases", tags=["Test Cases"])
app.include_router(automation.router, prefix="/api/automation", tags=["Automation"])
app.include_router(bugreports.router, prefix="/api/bugreports", tags=["Bug Reports"])

@app.get("/")
def root():
    key = os.getenv("GROQ_API_KEY")
    return {
        "message": "QA Assistant API is running",
        "ai_provider": "Groq (Llama 3 70B) - Free",
        "api_key_loaded": bool(key),
        "api_key_preview": f"{key[:10]}..." if key else "NOT FOUND"
    }
