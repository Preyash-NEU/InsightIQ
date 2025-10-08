from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_insights():
    return {"message": "Get insights endpoint"}

@router.post("/generate")
async def generate_insights():
    return {"message": "Generate insights endpoint"}