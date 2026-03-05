import json
import os
from openai import AsyncOpenAI
from google import genai
from google.genai import types
from app.ai.schemas import SparkRequest

api_key = os.environ.get("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=api_key) if api_key else None

GEMINI_KEYS = [
    os.environ.get("GEMINI_API_KEY_1"),
    os.environ.get("GEMINI_API_KEY_2"),
    os.environ.get("GEMINI_API_KEY_3"),
    os.environ.get("GEMINI_API_KEY_4"),
    os.environ.get("GEMINI_API_KEY_5"),
    os.environ.get("GEMINI_API_KEY_6"),
]
GEMINI_KEYS = [k for k in GEMINI_KEYS if k]  # filter out Nones


# Common Prompt
def build_prompts(request: SparkRequest):
    sys_prompt = f"""You are an expert frontend AI assistant. The user wants to modify an HTML element or the entire page.
You will be provided with:
1. Global CSS of the project
2. Global JS of the project
3. The selected context's HTML, CSS Classes, Inline Styles, and JS.
4. The user's prompt.

Your goal is to output EXACTLY 3 distinct, creative, and working suggestions that fulfill the prompt.

CRITICAL INSTRUCTIONS:
1. SANDBOXED HTML: The "html" field MUST ONLY contain the innerHTML of the target element. DO NOT include the target element's own tag (e.g., if editing a <div>, do not return <div>...</div>, just the content inside).
2. ROOT STYLING: Any changes to the target element itself (background, glassmorphism, border, etc.) MUST be placed in the "css_classes" or "inline_styles" fields.
3. PRESERVE CONTENT: If the user asks for styling WITHOUT asking to change children/text, you MUST include the existing children/innerHTML in your "html" field.
4. DECORATIVE ELEMENTS: If adding decorative elements like blurs or orbs, use absolute positioned elements INSIDE the "html" field while preserving original content.
5. NO OVERWRITE: Do not overwrite the entire structure unless structural changes are explicitly requested.
6. VANILLA TECH: Always use vanilla HTML/CSS/JS.

Return JSON matching this schema exactly:
{{
  "suggestions": [
    {{
      "title": "Short descriptive title",
      "description": "Short explanation",
      "html": "The updated HTML snippet",
      "css_classes": "The updated space-separated css classes",
      "inline_styles": "The updated inline css string",
      "js": "The updated javascript logic associated with this element",
      "global_css_additions": "Any new global CSS rules to add (optional, keep empty string if none)",
      "global_js_additions": "Any new global JS to add (optional, keep empty string if none)"
    }}
  ]
}}
Ensure exactly 3 items in the `suggestions` array.
"""

    user_content = f"""
=== User Prompt ===
{request.prompt}

=== Global Context ===
Global CSS:
```css
{request.context.global_css}
```
Global JS:
```js
{request.context.global_js}
```

=== Sub-Context (ID: {request.context.element.element_id}) ===
HTML:
```html
{request.context.element.element_html}
```
CSS Classes:
{request.context.element.element_css_classes}
Inline Styles:
{request.context.element.element_inline_styles}
JS:
```js
{request.context.element.element_js}
```
"""
    return sys_prompt, user_content


async def generate_spark_suggestions(request: SparkRequest) -> list:
    is_gemini = "gemini" in request.model.lower() or "gemma" in request.model.lower()
    sys_prompt, user_content = build_prompts(request)

    if is_gemini:
        if not GEMINI_KEYS:
            raise ValueError("No Gemini API keys found in environment.")

        last_error = None
        for key in GEMINI_KEYS:
            try:
                client = genai.Client(api_key=key)

                # Setup specific model
                response = client.models.generate_content(
                    model=request.model,
                    contents=user_content,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7,
                        system_instruction=sys_prompt,
                    ),
                )

                text_content = response.text
                data = json.loads(text_content)
                return data.get("suggestions", [])

            except Exception as e:
                err_str = str(e).lower()
                print(f"Gemini API Error with a key (routing to next if 429): {e}")
                last_error = e
                # Fallback on 429 quota or rate limit issues
                if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                    continue
                else:
                    # Depending on exact error, might want to break and fail fast, but continuing is safer for robustness
                    continue

        # If we exhausted all keys
        if last_error:
            raise ValueError(
                f"All Gemini keys exhausted or failed. Last error: {last_error}"
            )
        return []

    else:
        # OpenAI path
        if not openai_client:
            raise ValueError("OPENAI_API_KEY is not set.")

        # Map internal fake model names to actual openai if necessary, defaults to passing string
        openai_model = request.model
        if openai_model in [
            "gpt-5.1-codex-mini",
            "gpt-5-mini",
            "gpt-5-nano",
            "gpt-4.1-mini",
            "gpt-4.1-nano",
            "codex-mini-latest",
        ]:
            # User wants to support these in UI, but we fallback to gpt-4o-mini under the hood for OpenAI unless they specifically exist
            openai_model = "gpt-4o-mini"

        response = await openai_client.chat.completions.create(
            model=openai_model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
        )

        try:
            data = json.loads(response.choices[0].message.content)
            return data.get("suggestions", [])
        except Exception as e:
            print(f"Error parsing OpenAI suggestions: {e}")
            return []
