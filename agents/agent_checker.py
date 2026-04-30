import requests, time, os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
checker_model = genai.GenerativeModel('gemini-flash-latest', system_instruction="You are a strict technical fact-checker. Tighten terminology, clarify explanations, and ensure all facts are properly checked.")
EDITOR_PUB_KEY = os.getenv("EDITOR_PUB_KEY")

print("Checker Agent started")
while True:
    try:
        resp = requests.get("http://127.0.0.1:9003/recv")
        if resp.status_code == 200:
            draft = resp.content.decode('utf-8')
            if draft:
                print("Checker received draft, analyzing...")
                critique = checker_model.generate_content(f"Review and correct the following draft:\n{draft}").text
                checker_section = f"{draft}\n\n## Fact-Checker Action\n{critique}"
                print("Checker analysis complete, sending to Editor...")
                res = requests.post("http://127.0.0.1:9003/send", headers={
                    "X-Destination-Peer-Id": EDITOR_PUB_KEY
                }, data=checker_section.encode('utf-8'))
                print("Checker sent message. Status:", res.status_code)
    except Exception as e:
        print("Checker error:", e)
    time.sleep(2)
