import json
import os
from openai import AsyncOpenAI
from app.ai.schemas import SparkRequest

api_key = os.environ.get("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None


async def generate_spark_suggestions(request: SparkRequest) -> list:
    if not client:
        raise ValueError("OPENAI_API_KEY is not set.")

    sys_prompt = f"""You are an expert frontend AI assistant. The user wants to modify an HTML element.
You will be provided with:
1. Global CSS of the project
2. Global JS of the project
3. The selected element's HTML, CSS Classes, Inline Styles, and JS.
4. The user's prompt.

Your goal is to output EXACTLY 3 distinct, creative, and working suggestions that fulfill the prompt.
A suggestion should modify the element. You can also add Global CSS/JS if absolutely necessary for animations or complex styles, but prefer element-level modifications if possible. Always use vanilla web technologies (HTML, CSS, JS).

Return JSON matching this schema exactly:
{{
  "suggestions": [
    {{
      "title": "Short descriptive title for this variant",
      "description": "Short explanation of the approach",
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

=== Element Context (ID: {request.context.element.element_id}) ===
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

    response = await client.chat.completions.create(
        model="gpt-4o-mini",  # using gpt-4o-mini for speed, but gpt-4o could be used
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
        print(f"Error parsing AI suggestions: {e}")
        return []
