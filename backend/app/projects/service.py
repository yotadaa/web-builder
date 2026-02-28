from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.projects.models import Project
from app.projects.schemas import ProjectCreate, ProjectUpdate
import uuid
from datetime import datetime


async def get_projects(db: AsyncSession, user_id: uuid.UUID):
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


async def create_project(
    db: AsyncSession, user_id: uuid.UUID, project_in: ProjectCreate
):
    db_project = Project(
        user_id=user_id,
        name=project_in.name,
        description=project_in.description,
        layout=project_in.layout,
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project


async def get_project(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    return result.scalars().first()


async def update_project(
    db: AsyncSession, db_project: Project, project_in: ProjectUpdate
):
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(db_project, field, value)
    await db.commit()
    await db.refresh(db_project)
    return db_project


async def delete_project(db: AsyncSession, db_project: Project):
    await db.delete(db_project)
    await db.commit()
    return True
