from fastapi import FastAPI

app = FastAPI(
    title="Idea Validator Agent Service",
    version="0.1.0",
)


@app.get("/")
async def root():
    return {
        "service": "agent-service",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
