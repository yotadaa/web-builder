from pydantic import BaseModel
from typing import Optional, List


class SparkElementContext(BaseModel):
    element_id: str
    element_html: str
    element_css_classes: str
    element_inline_styles: str
    element_js: str


class SparkContext(BaseModel):
    global_css: str
    global_js: str
    element: SparkElementContext


class SparkRequest(BaseModel):
    model: str = "gpt-4o-mini"
    prompt: str
    context: SparkContext
