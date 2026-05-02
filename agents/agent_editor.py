import requests, time, os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
editor_model = genai.GenerativeModel('gemini-flash-latest', system_instruction="You are a senior editor. Polish the fact-checked content into a clean and readable blog post. You MUST respect the TONE specified in the input metadata (Professional, Creative, Technical, or Viral).")
WRITER_PUB_KEY = os.getenv("WRITER_PUB_KEY")

print("Editor Agent started")
while True:
    try:
        resp = requests.get("http://127.0.0.1:9004/recv")
        if resp.status_code == 200:
            draft = resp.content.decode('utf-8')
            if draft:
                print("Editor received critique, polishing...")
                # Extract tone if present in metadata
                tone = "Professional"
                if "TONE:" in draft:
                    tone = draft.split("TONE:")[1].split("\n")[0].strip()
                
                final_post = editor_model.generate_content(f"Polish this content using a {tone} tone:\n{draft}").text
                editor_section = f"{draft}\n\n## Editor Action\n{final_post}"
                print("Editor polish complete, sending to Writer...")
                res = requests.post("http://127.0.0.1:9004/send", headers={
                    "X-Destination-Peer-Id": WRITER_PUB_KEY
                }, data=f"FINAL_EDIT: {editor_section}".encode('utf-8'))
                print("Editor sent message. Status:", res.status_code)
    except Exception as e:
        print("Editor error:", e)
    time.sleep(2)
