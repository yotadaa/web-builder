from fastapi import APIRouter, Depends, HTTPException
from app.ai.schemas import SparkRequest
from app.ai.spark_service import generate_spark_suggestions
from app.auth.routes import get_current_user
from app.auth.models import User

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/spark")
async def spark_endpoint(
    request: SparkRequest, current_user: User = Depends(get_current_user)
):
    try:
        suggestions = await generate_spark_suggestions(request)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
