"""
Prompt templates module for Westcliff AI Service.

Provides YAML-based prompt templates with variable substitution and
industry-standard prompt injection protection.
"""
from .loader import (
    get_prompt,
    get_all_prompts,
    load_all_templates,
    reload_templates,
    PromptTemplate,
    PromptTemplateError,
)

__all__ = [
    "get_prompt",
    "get_all_prompts",
    "load_all_templates",
    "reload_templates",
    "PromptTemplate",
    "PromptTemplateError",
]
