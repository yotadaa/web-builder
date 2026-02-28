from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: str = "vertical"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    last_opened: datetime

    class Config:
        from_attributes = True
