from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_datasets():
    return {"message": "Get datasets endpoint"}

@router.post("/")
async def create_dataset():
    return {"message": "Create dataset endpoint"}