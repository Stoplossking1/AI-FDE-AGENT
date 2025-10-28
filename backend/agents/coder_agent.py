"""
coder_agent.py
──────────────
Generates all code files from a plan.

Simple flow:
1. Load plan from data/plans/{project_id}.json
2. Generate each file using LLM (OpenAI GPT-4o)
3. Write to data/workspace/{project_id}/
4. Return manifest of created files
"""

from __future__ import annotations
import os
import json
from typing import Any, Dict, List

from core.llm_claude import claude_call as llm_call
from core.logger import log


# ---------- main entrypoint ----------
async def generate_code(project_id: str) -> Dict[str, Any]:
    """
    Generate all code files from a plan.
    
    Args:
        project_id: ID of project (loads plan from data/plans/{id}.json)
        
    Returns:
        dict with:
            - file_count: number of files created
            - files: list of file paths
            - workspace_path: absolute path to workspace
    """
    
    # 1. Load plan
    plan = _load_plan(project_id)
    file_tree = plan.get('file_tree', [])
    file_count = len(file_tree) if isinstance(file_tree, list) else sum(len(v) for v in file_tree.values())
    log.info(f"[Coder] Loaded plan with {file_count} files to generate")
    
    # 2. Setup workspace
    workspace = f"data/workspace/{project_id}"
    os.makedirs(workspace, exist_ok=True)
    log.info(f"[Coder] Workspace: {workspace}")
    
    # 3. Get flat list of all files to generate
    all_files = _flatten_file_tree(plan.get("file_tree", {}))
    log.info(f"[Coder] Generating {len(all_files)} files...")
    
    created_files = []
    
    # 4. Generate each file
    for i, file_path in enumerate(all_files, 1):
        log.info(f"[Coder] [{i}/{len(all_files)}] Generating {file_path}...")
        
        try:
            code = await _generate_file(file_path, plan)
            _write_file(workspace, file_path, code)
            created_files.append(file_path)
            log.success(f"[Coder] ✓ {file_path}")
            
        except Exception as e:
            log.error(f"[Coder] ✗ Failed to generate {file_path}: {e}")
            # Continue with other files instead of failing completely
    
    # 5. Return manifest
    log.success(f"[Coder] Code generation complete! {len(created_files)}/{len(all_files)} files created")
    
    return {
        "file_count": len(created_files),
        "files": created_files,
        "workspace_path": workspace,
        "failed_count": len(all_files) - len(created_files)
    }


# ---------- helper functions ----------
def _load_plan(project_id: str) -> Dict[str, Any]:
    """
    Load plan from data/plans/{project_id}.json
    
    Args:
        project_id: project identifier
        
    Returns:
        Plan dictionary
        
    Raises:
        FileNotFoundError: if plan doesn't exist
    """
    path = f"data/plans/{project_id}.json"
    if not os.path.exists(path):
        raise FileNotFoundError(f"[Coder] No plan found at {path}")
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _flatten_file_tree(file_tree) -> List[str]:
    """
    Convert file_tree to flat list.
    
    Args:
        file_tree: either a flat list ["frontend/app/page.tsx"] 
                   or nested dict {"frontend": ["app/page.tsx"]}
        
    Returns:
        Flat list of file paths
    """
    # If it's already a list, return it
    if isinstance(file_tree, list):
        return file_tree
    
    # If it's a dict (old format), flatten it
    if isinstance(file_tree, dict):
        files = []
        for category, paths in file_tree.items():
            if isinstance(paths, list):
                files.extend(paths)
        return files
    
    return []


async def _generate_file(file_path: str, plan: Dict[str, Any]) -> str:
    """
    Generate code for a single file using LLM.
    
    The prompt includes the ENTIRE plan as context since it already contains:
    - stack (tech choices)
    - entities (data models)
    - api_routes (endpoints)
    - dependencies (packages available)
    
    Args:
        file_path: relative path of file to generate (e.g. "components/DogCard.tsx")
        plan: complete project plan
        
    Returns:
        Generated code as string
    """
    
    # Determine file type for better instructions
    file_ext = file_path.split('.')[-1] if '.' in file_path else ''
    
    # Build type-specific instructions
    type_hints = _get_type_specific_instructions(file_ext, file_path)
    
    system_prompt = f"""You are an expert software engineer.
Generate production-ready code following best practices.
Tech stack: {plan['stack'].get('frontend', 'N/A')} / {plan['stack'].get('backend', 'N/A')}

CRITICAL RULES:
- Return ONLY raw code - NO markdown code blocks (no ```)
- NO explanations, NO comments outside the code itself
- Start directly with the first line of code (imports, etc.)
- Use proper imports and types
- Include brief inline comments for complex logic only
- Make it functional and production-ready
{type_hints}"""

    user_prompt = f"""Generate code for this file: {file_path}

PROJECT PLAN:
{json.dumps(plan, indent=2)}

REQUIREMENTS:
- File path: {file_path}
- Use the tech stack, entities, API routes, and dependencies from the plan above
- Make sure imports reference the correct paths based on file location
- Include proper error handling where appropriate
- Follow framework conventions for the stack being used

Return ONLY the code content for this file, nothing else."""

    code = await llm_call(
        prompt=user_prompt,
        system=system_prompt,
        temperature=0.3,  # Slightly creative but mostly deterministic
        max_tokens=4096   # Enough for most files
    )
    
    # Strip markdown code blocks if LLM added them (Claude sometimes does this)
    code = _strip_markdown_blocks(code)
    
    return code.strip()


def _get_type_specific_instructions(file_ext: str, file_path: str) -> str:
    """
    Return specific instructions based on file type.
    
    Args:
        file_ext: file extension (tsx, py, json, etc.)
        file_path: full file path for context
        
    Returns:
        Additional instructions string
    """
    if file_ext in ['tsx', 'ts', 'jsx', 'js']:
        return "- Use TypeScript with proper types\n- Use React best practices (hooks, functional components)"
    elif file_ext == 'py':
        return "- Use type hints\n- Follow PEP 8\n- Use async/await for API routes"
    elif file_ext == 'json':
        return "- Return valid JSON only\n- Use proper formatting"
    elif file_ext in ['css', 'scss']:
        return "- Use modern CSS practices\n- Include responsive design"
    else:
        return ""


def _strip_markdown_blocks(code: str) -> str:
    """
    Remove markdown code blocks if LLM wrapped the code in them.
    
    Claude sometimes returns:
        ```typescript
        actual code here
        ```
    
    This function strips those markers.
    
    Args:
        code: raw code from LLM
        
    Returns:
        Clean code without markdown blocks
    """
    code = code.strip()
    
    # Check if it starts with markdown code block
    if code.startswith("```"):
        lines = code.split("\n")
        
        # Remove first line (```language)
        if lines:
            lines = lines[1:]
        
        # Remove last line if it's just ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        
        code = "\n".join(lines)
    
    return code


def _write_file(workspace: str, file_path: str, content: str):
    """
    Write generated code to workspace.
    
    Creates parent directories if they don't exist.
    
    Args:
        workspace: base workspace directory
        file_path: relative file path
        content: code content to write
    """
    full_path = os.path.join(workspace, file_path)
    
    # Create parent directories
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Write file
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    log.debug(f"[Coder] Written {len(content)} bytes to {full_path}")

