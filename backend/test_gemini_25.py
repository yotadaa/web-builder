import os
from dotenv import load_dotenv
load_dotenv("/home/mukhtada/projects/web-builder/.env")

key = os.environ.get("GEMINI_API_KEY_1")
if key:
    import google.generativeai as genai
    genai.configure(api_key=key)
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Hello, this is a test. Reply 'OK'.")
        print("Response from gemini-2.5-flash:", response.text)
    except Exception as e:
        print("Error with gemini-2.5-flash:", type(e), str(e))
else:
    print("No API key found")
