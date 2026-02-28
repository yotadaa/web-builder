from datetime import datetime
from sqlalchemy import String, DateTime, UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.shared.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    layout: Mapped[str] = mapped_column(String(50), nullable=False, default="vertical")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_opened: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
