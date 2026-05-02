from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import os
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
writer_model = genai.GenerativeModel('gemini-flash-latest', system_instruction="You are a blog writer. Provide generic explanations and a broad overview.")

CHECKER_PUB_KEY = os.getenv("CHECKER_PUB_KEY")

class TopicRequest(BaseModel):
    topic: str
    tone: str = "Professional"

@app.post("/generate")
def start_agent_workflow(req: TopicRequest):
    try:
        draft = writer_model.generate_content(f"Write a 3-paragraph draft about: {req.topic}. The tone must be {req.tone}.").text
        draft_section = f"TONE: {req.tone}\n\n## Writer Draft\n{draft}"
        
        requests.post("http://127.0.0.1:9002/send", headers={
            "X-Destination-Peer-Id": CHECKER_PUB_KEY
        }, data=draft_section.encode('utf-8'))
        
        while True:
            try:
                resp = requests.get("http://127.0.0.1:9002/recv")
                if resp.status_code == 200:
                    payload = resp.content.decode('utf-8')
                    if "FINAL_EDIT" in payload:
                        final_text = payload.replace("FINAL_EDIT:", "")
                        return {"status": "success", "content": final_text}
            except Exception as poll_e:
                pass
            time.sleep(2)
    except Exception as e:
        return {"status": "error", "content": str(e)}
