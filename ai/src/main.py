from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .prompts import load_all_templates, PromptTemplateError
from .routes.assist import router as assist_router
from .routes.intake import router as intake_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the FastAPI application."""
    # Startup
    logger.info("Starting Westcliff AI Service")
    logger.info(f"LLM Provider: {settings.llm_provider}")
    logger.info(f"LLM Model: {settings.llm_model}")
    
    # Validate configuration
    try:
        settings.validate_provider_config()
        logger.info("Provider configuration validated")
    except ValueError as e:
        logger.error(f" Configuration error: {e}")
        raise
    
    # Load prompt templates
    try:
        templates = load_all_templates()
        logger.info(f"Loaded {len(templates)} prompt template(s)")
    except PromptTemplateError as e:
        logger.error(f"Failed to load prompt templates: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Westcliff AI Service")


app = FastAPI(
    title="Westcliff AI Service",
    version="0.1.0",
    docs_url="/docs",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(intake_router)
app.include_router(assist_router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "ai",
        "provider": settings.llm_provider,
        "model": settings.llm_model
    }
