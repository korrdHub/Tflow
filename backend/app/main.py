from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, plans, tracking


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="严师APP Backend", version="0.1.0", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(tracking.router)


@app.get("/health")
def health():
    return {"status": "ok"}
