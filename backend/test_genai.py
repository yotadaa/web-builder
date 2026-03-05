import os
from dotenv import load_dotenv
load_dotenv("/home/mukhtada/projects/web-builder/.env")
from google import genai
from google.genai import types

key = os.environ.get("GEMINI_API_KEY_1")
client = genai.Client(api_key=key)

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Reply "OK" in JSON format {"reply": "OK"}',
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.7,
    )
)
print("Response:", response.text)
