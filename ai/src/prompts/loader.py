"""
Prompt Template Loader

Loads YAML prompt templates at startup, validates their structure,
and provides template retrieval with variable substitution.
"""
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml

logger = logging.getLogger(__name__)

# Directory containing prompt templates
PROMPTS_DIR = Path(__file__).parent

# Required fields in each YAML template
REQUIRED_FIELDS = {"name", "version", "system", "user_template", "output_schema"}

# Valid output schema references
VALID_OUTPUT_SCHEMAS = {
    "IntakeTriageResponse",
    "IntakeFollowupResponse",
    "SummarizeResponse",
    "DraftReplyResponse",
    "SuggestStepsResponse",
}


@dataclass
class PromptTemplate:
    """
    Represents a loaded prompt template with validation and rendering capabilities.
    
    Attributes:
        name: Unique identifier for the template
        version: Semantic version string
        system: System prompt text (instructions for the AI)
        user_template: User prompt template with {placeholders}
        output_schema: Name of the Pydantic model for output validation
    """
    name: str
    version: str
    system: str
    user_template: str
    output_schema: str
    file_path: Optional[str] = None
    _placeholders: set[str] = field(default_factory=set, repr=False)
    
    def __post_init__(self):
        """Extract placeholders from user_template after initialization."""
        # Find all {placeholder} patterns, excluding escaped braces
        self._placeholders = set(re.findall(r'\{(\w+)\}', self.user_template))
    
    @property
    def placeholders(self) -> set[str]:
        """Return the set of placeholder names in the user template."""
        return self._placeholders.copy()
    
    def render_user_prompt(self, **kwargs: Any) -> str:
        """
        Render the user template with provided variables.
        
        Args:
            **kwargs: Variable name-value pairs for substitution
            
        Returns:
            Rendered user prompt string
            
        Raises:
            ValueError: If required placeholders are missing
        """
        # Check for missing required placeholders
        provided = set(kwargs.keys())
        missing = self._placeholders - provided
        
        # Filter out optional sections (ending with _section)
        required_missing = {p for p in missing if not p.endswith('_section')}
        
        if required_missing:
            raise ValueError(
                f"Missing required template variables: {', '.join(sorted(required_missing))}. "
                f"Template '{self.name}' requires: {', '.join(sorted(self._placeholders))}"
            )
        
        # Provide empty strings for optional section placeholders not provided
        render_vars = dict(kwargs)
        for placeholder in missing:
            if placeholder.endswith('_section'):
                render_vars[placeholder] = ""
        
        try:
            return self.user_template.format(**render_vars)
        except KeyError as e:
            raise ValueError(f"Template rendering error: {e}") from e
    
    def render_system_prompt(self) -> str:
        """
        Return the system prompt.
        
        The system prompt is returned as-is without variable substitution
        to prevent injection through template variables.
        
        Returns:
            System prompt string
        """
        return self.system


class PromptTemplateError(Exception):
    """Raised when there's an error loading or validating a prompt template."""
    pass


def _validate_template_structure(data: dict, file_path: str) -> None:
    """
    Validate that a loaded YAML has all required fields.
    
    Args:
        data: Parsed YAML dictionary
        file_path: Path to the file (for error messages)
        
    Raises:
        PromptTemplateError: If validation fails
    """
    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        raise PromptTemplateError(
            f"Template '{file_path}' missing required fields: {', '.join(sorted(missing))}"
        )
    
    # Validate output_schema reference
    if data["output_schema"] not in VALID_OUTPUT_SCHEMAS:
        raise PromptTemplateError(
            f"Template '{file_path}' has invalid output_schema '{data['output_schema']}'. "
            f"Must be one of: {', '.join(sorted(VALID_OUTPUT_SCHEMAS))}"
        )
    
    # Validate version format (semver-like)
    version = str(data["version"])
    if not re.match(r'^\d+\.\d+\.\d+$', version):
        raise PromptTemplateError(
            f"Template '{file_path}' has invalid version '{version}'. "
            f"Expected semantic version format (e.g., '1.0.0')"
        )
    
    # Validate system prompt has guardrails
    system = data.get("system", "")
    guardrail_indicators = [
        "guardrail",
        "security",
        "must not",
        "never",
        "guidance only",
        "no legal",
    ]
    has_guardrails = any(
        indicator.lower() in system.lower() 
        for indicator in guardrail_indicators
    )
    if not has_guardrails:
        logger.warning(
            f"Template '{file_path}' may be missing guardrail language in system prompt"
        )


def _load_template_file(file_path: Path) -> PromptTemplate:
    """
    Load and validate a single YAML template file.
    
    Args:
        file_path: Path to the YAML file
        
    Returns:
        PromptTemplate instance
        
    Raises:
        PromptTemplateError: If loading or validation fails
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        raise PromptTemplateError(f"Failed to parse YAML in '{file_path}': {e}") from e
    except OSError as e:
        raise PromptTemplateError(f"Failed to read '{file_path}': {e}") from e
    
    if not isinstance(data, dict):
        raise PromptTemplateError(f"Template '{file_path}' must be a YAML mapping")
    
    _validate_template_structure(data, str(file_path))
    
    return PromptTemplate(
        name=data["name"],
        version=str(data["version"]),
        system=data["system"].strip(),
        user_template=data["user_template"].strip(),
        output_schema=data["output_schema"],
        file_path=str(file_path),
    )


# Global template cache (loaded at startup)
_templates: dict[str, PromptTemplate] = {}
_loaded: bool = False


def _ensure_loaded() -> None:
    """Load templates if not already loaded."""
    global _loaded
    if not _loaded:
        load_all_templates()


def load_all_templates() -> dict[str, PromptTemplate]:
    """
    Load all YAML templates from the prompts directory.
    
    This function is called automatically on first access, but can be called
    explicitly (e.g., at application startup) to fail fast on errors.
    
    Returns:
        Dictionary mapping template names to PromptTemplate instances
        
    Raises:
        PromptTemplateError: If any template fails to load
    """
    global _templates, _loaded
    
    _templates.clear()
    yaml_files = list(PROMPTS_DIR.glob("*.yml")) + list(PROMPTS_DIR.glob("*.yaml"))
    
    if not yaml_files:
        logger.warning(f"No YAML templates found in {PROMPTS_DIR}")
        _loaded = True
        return _templates
    
    errors = []
    for file_path in yaml_files:
        try:
            template = _load_template_file(file_path)
            if template.name in _templates:
                raise PromptTemplateError(
                    f"Duplicate template name '{template.name}' "
                    f"in '{file_path}' and '{_templates[template.name].file_path}'"
                )
            _templates[template.name] = template
            logger.info(f"Loaded template '{template.name}' v{template.version}")
        except PromptTemplateError as e:
            errors.append(str(e))
    
    if errors:
        raise PromptTemplateError(
            f"Failed to load {len(errors)} template(s):\n" + "\n".join(errors)
        )
    
    _loaded = True
    logger.info(f"Successfully loaded {len(_templates)} prompt template(s)")
    return _templates


def get_prompt(name: str) -> PromptTemplate:
    """
    Retrieve a prompt template by name.
    
    Args:
        name: The template name (e.g., 'intake_triage', 'assist_summarize')
        
    Returns:
        The PromptTemplate instance
        
    Raises:
        ValueError: If the template name is not found
        PromptTemplateError: If templates failed to load
    """
    _ensure_loaded()
    
    if name not in _templates:
        available = ", ".join(sorted(_templates.keys())) or "(none)"
        raise ValueError(
            f"Unknown prompt template '{name}'. Available templates: {available}"
        )
    
    return _templates[name]


def get_all_prompts() -> dict[str, PromptTemplate]:
    """
    Get all loaded prompt templates.
    
    Returns:
        Dictionary mapping template names to PromptTemplate instances
    """
    _ensure_loaded()
    return _templates.copy()


def reload_templates() -> dict[str, PromptTemplate]:
    """
    Force reload all templates from disk.
    
    Useful for development when templates are modified.
    
    Returns:
        Dictionary mapping template names to PromptTemplate instances
    """
    global _loaded
    _loaded = False
    return load_all_templates()
