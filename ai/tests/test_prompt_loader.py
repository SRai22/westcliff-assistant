"""
Tests for the prompt template loader.

Tests cover:
- Loading all 4 YAML templates successfully
- Template variable rendering
- Validation of template structure
- Guardrail language presence in system prompts
"""
import pytest
from pathlib import Path


class TestPromptLoader:
    """Tests for the prompt loader module."""
    
    def test_get_prompt_intake_triage(self):
        """Test loading intake_triage template."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        
        assert template.name == "intake_triage"
        assert template.version == "1.0.0"
        assert template.output_schema == "IntakeTriageResponse"
        assert len(template.system) > 0
        assert len(template.user_template) > 0
    
    def test_get_prompt_intake_followup(self):
        """Test loading intake_followup template."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_followup")
        
        assert template.name == "intake_followup"
        assert template.output_schema == "IntakeFollowupResponse"
    
    def test_get_prompt_assist_summarize(self):
        """Test loading assist_summarize template."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_summarize")
        
        assert template.name == "assist_summarize"
        assert template.output_schema == "SummarizeResponse"
    
    def test_get_prompt_assist_draft_reply(self):
        """Test loading assist_draft_reply template."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_draft_reply")
        
        assert template.name == "assist_draft_reply"
        assert template.output_schema == "DraftReplyResponse"
    
    def test_get_all_prompts(self):
        """Test that all 4 prompts are loaded."""
        from src.prompts import get_all_prompts
        
        prompts = get_all_prompts()
        
        assert len(prompts) == 4
        assert "intake_triage" in prompts
        assert "intake_followup" in prompts
        assert "assist_summarize" in prompts
        assert "assist_draft_reply" in prompts
    
    def test_unknown_prompt_raises_error(self):
        """Test that requesting unknown template raises ValueError."""
        from src.prompts import get_prompt
        
        with pytest.raises(ValueError) as exc_info:
            get_prompt("nonexistent_template")
        
        assert "Unknown prompt template" in str(exc_info.value)
        assert "nonexistent_template" in str(exc_info.value)


class TestTemplateRendering:
    """Tests for template variable rendering."""
    
    def test_render_intake_triage(self):
        """Test rendering intake_triage user template with variables."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        rendered = template.render_user_prompt(
            text="I can't log into my Canvas account",
            user_context_section=""
        )
        
        assert "I can't log into my Canvas account" in rendered
        assert "{text}" not in rendered  # Placeholder should be replaced
    
    def test_render_intake_followup(self):
        """Test rendering intake_followup user template."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_followup")
        rendered = template.render_user_prompt(
            original_category="Learning Technologies",
            original_service="Canvas LMS",
            original_summary="Canvas login issue",
            original_description="Student cannot access Canvas",
            original_priority="MEDIUM",
            original_confidence="0.85",
            questions_and_answers="Q1: What error do you see?\nA1: Invalid credentials"
        )
        
        assert "Learning Technologies" in rendered
        assert "Canvas LMS" in rendered
        assert "Invalid credentials" in rendered
    
    def test_render_assist_summarize(self):
        """Test rendering assist_summarize user template."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_summarize")
        rendered = template.render_user_prompt(
            ticket_id="T-12345",
            messages="[Student]: Help!\n[Staff]: What's the issue?"
        )
        
        assert "T-12345" in rendered
        assert "Help!" in rendered
    
    def test_render_assist_draft_reply(self):
        """Test rendering assist_draft_reply user template."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_draft_reply")
        rendered = template.render_user_prompt(
            ticket_id="T-12345",
            tone="PROFESSIONAL",
            messages="Student asked about refund",
            additional_context_section=""
        )
        
        assert "T-12345" in rendered
        assert "PROFESSIONAL" in rendered
    
    def test_missing_required_variable_raises_error(self):
        """Test that missing required variables raises ValueError."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        
        with pytest.raises(ValueError) as exc_info:
            template.render_user_prompt()  # Missing 'text'
        
        assert "Missing required template variables" in str(exc_info.value)
    
    def test_optional_section_variables(self):
        """Test that _section variables are optional."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        
        # Should not raise even without user_context_section
        rendered = template.render_user_prompt(text="Test query")
        assert "Test query" in rendered


class TestSystemPromptGuardrails:
    """Tests for guardrail presence in system prompts."""
    
    def test_intake_triage_has_guardrails(self):
        """Test intake_triage system prompt contains guardrails."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        system = template.render_system_prompt().lower()
        
        # Check for security policy
        assert "security" in system
        assert "ignore" in system  # Instructions to ignore prompt injection
        
        # Check for guardrails section
        assert "guardrail" in system
        assert "guidance only" in system
        assert "no legal advice" in system or "legal" in system
        assert "immigration" in system
    
    def test_intake_followup_has_guardrails(self):
        """Test intake_followup system prompt contains guardrails."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_followup")
        system = template.render_system_prompt().lower()
        
        assert "guardrail" in system
        assert "guidance only" in system
    
    def test_assist_summarize_has_guardrails(self):
        """Test assist_summarize system prompt contains guardrails."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_summarize")
        system = template.render_system_prompt().lower()
        
        assert "security" in system
        assert "ignore" in system
    
    def test_assist_draft_reply_has_guardrails(self):
        """Test assist_draft_reply system prompt contains guardrails."""
        from src.prompts import get_prompt
        
        template = get_prompt("assist_draft_reply")
        system = template.render_system_prompt().lower()
        
        assert "guardrail" in system
        assert "staff review" in system
        assert "no promise" in system or "never promise" in system or "do not promise" in system
    
    def test_all_templates_have_11_categories(self):
        """Test that templates reference the 11 Westcliff categories."""
        from src.prompts import get_prompt
        
        categories_to_check = [
            "Information Technology",
            "International Affairs",
            "Financial Aid",
        ]
        
        template = get_prompt("intake_triage")
        system = template.render_system_prompt()
        
        for category in categories_to_check:
            assert category in system, f"Category '{category}' not found in system prompt"


class TestTemplateStructure:
    """Tests for template structural requirements."""
    
    def test_valid_output_schema_references(self):
        """Test that all templates reference valid output schemas."""
        from src.prompts import get_all_prompts
        
        valid_schemas = {
            "IntakeTriageResponse",
            "IntakeFollowupResponse",
            "SummarizeResponse", 
            "DraftReplyResponse",
        }
        
        prompts = get_all_prompts()
        
        for name, template in prompts.items():
            assert template.output_schema in valid_schemas, \
                f"Template '{name}' has invalid output_schema: {template.output_schema}"
    
    def test_templates_have_version(self):
        """Test that all templates have a version string."""
        from src.prompts import get_all_prompts
        import re
        
        prompts = get_all_prompts()
        
        for name, template in prompts.items():
            assert template.version, f"Template '{name}' missing version"
            assert re.match(r'^\d+\.\d+\.\d+$', template.version), \
                f"Template '{name}' has invalid version format: {template.version}"
    
    def test_placeholders_identified(self):
        """Test that placeholders are correctly identified in templates."""
        from src.prompts import get_prompt
        
        template = get_prompt("intake_triage")
        placeholders = template.placeholders
        
        assert "text" in placeholders
        assert "user_context_section" in placeholders
