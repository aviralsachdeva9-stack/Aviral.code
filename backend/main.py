from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY missing in .env")
ai_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or Key missing in .env")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="CodeLens AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email: str

class VerifyRequest(BaseModel):
    email: str
    otp: str

class CodeRequest(BaseModel):
    code: str
    language: str = "python"

def get_user_id(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")

@app.post("/api/auth/send-otp")
def send_otp(req: EmailRequest):
    try:
        supabase.auth.sign_in_with_otp({"email": req.email})
        return {"status": "success", "message": "OTP sent to your email!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyRequest):
    try:
        res = supabase.auth.verify_otp({"email": req.email, "token": req.otp, "type": "email"})
        return {
            "status": "success",
            "access_token": res.session.access_token,
            "user_id": res.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid OTP or expired")

@app.post("/api/review")
def review_code(req: CodeRequest, user_id: str = Depends(get_user_id)):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    system_prompt = f"""You are aviral.code, an elite AI coding assistant with deep expertise across all programming languages and frameworks. The user is working in {req.language}.

You can help with:
- 🔍 **Code Review** — Analyze for bugs, anti-patterns, security issues, and performance
- ⚡ **Code Generation** — Write clean, efficient, production-ready code from descriptions
- 🐛 **Debugging** — Identify root causes and provide precise fixes with explanations
- 💡 **Explanations** — Break down complex concepts with clarity and examples
- 🚀 **Optimization** — Improve time/space complexity, readability, and maintainability
- 🏗️ **Architecture** — Design patterns, system design, and best practices

Your response guidelines:
- Respond in clean, well-structured Markdown
- Always use fenced code blocks with the correct language tag: ```{req.language}
- Be concise but thorough — no fluff, only value
- Provide complete, working, production-ready code
- When reviewing, use clear section headers with emojis
- Adapt naturally to what the user needs — don't force a rigid format if it's a simple question
- Be direct and confident like a senior engineer pair-programming with them"""

    try:
        ai_response = ai_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.code}
            ],
            temperature=0.25,
            max_tokens=4096,
        )
        review_text = ai_response.choices[0].message.content

        supabase.table("code_reviews").insert({
            "user_id": user_id,
            "language": req.language,
            "code_input": req.code,
            "review_output": review_text
        }).execute()

        return {"status": "success", "review": review_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history(user_id: str = Depends(get_user_id)):
    try:
        response = supabase.table("code_reviews").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{item_id}")
def delete_history_item(item_id: str, user_id: str = Depends(get_user_id)):
    try:
        supabase.table("code_reviews").delete().eq("id", item_id).eq("user_id", user_id).execute()
        return {"status": "success", "message": "Chat deleted successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))