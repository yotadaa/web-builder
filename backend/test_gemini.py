import os
import google.generativeai as genai

keys = [
    os.environ.get("GEMINI_API_KEY_1"),
    os.environ.get("GEMINI_API_KEY_2"),
    os.environ.get("GEMINI_API_KEY_3"),
]
key = next((k for k in keys if k), None)
if key:
    genai.configure(api_key=key)
    try:
        models = genai.list_models()
        for m in models:
            if "generateContent" in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print("Error:", e)
else:
    print("No API key found")
