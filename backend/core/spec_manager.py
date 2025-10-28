"""
spec_manager.py
────────────────
Manages the "Living Spec" — the evolving structured product definition.

Responsibilities:
  • Create a new spec for a meeting/session
  • Incrementally update spec as intents arrive (from processors/intent_extractor)
  • Merge new intents into the existing spec
  • Validate, normalize, and store specs persistently
  • Freeze/unfreeze the spec when the user confirms "Build"

Output files:
  backend/data/specs/{project_id}.json  (live / frozen versions)
"""

import os
import json
import copy
from typing import Any, Dict, List, Optional
from core.logger import log

# ----------------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------------
SPEC_DIR = "data/specs"
os.makedirs(SPEC_DIR, exist_ok=True)


# ----------------------------------------------------------------------------
# Utilities
# ----------------------------------------------------------------------------
def _spec_path(project_id: str, frozen: bool = False) -> str:
    suffix = "frozen" if frozen else "live"
    return f"{SPEC_DIR}/{project_id}_{suffix}.json"


# ----------------------------------------------------------------------------
# Spec lifecycle management
# ----------------------------------------------------------------------------
def create_new_spec(project_id: str) -> Dict[str, Any]:
    """
    Initialize a blank spec for a new project/meeting.

    Returns the empty spec structure.
    """
    spec = {
        "project_id": project_id,
        "entities": [],
        "pages": [],
        "integrations": [],
        "acceptance": [],
        "constraints": [],
        "metadata": {"status": "live"},
    }
    save_spec(project_id, spec)
    log.info(f"[Spec] Created new spec for {project_id}")
    return spec


def load_spec(project_id: str) -> Dict[str, Any]:
    """
    Load the current live spec for a project.
    """
    path = _spec_path(project_id)
    if not os.path.exists(path):
        log.warning(f"[Spec] No live spec found for {project_id}, creating new one.")
        return create_new_spec(project_id)

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_spec(project_id: str, spec: Dict[str, Any]) -> None:
    """
    Save the live spec to disk.
    """
    path = _spec_path(project_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
    log.debug(f"[Spec] Saved live spec → {path}")


def load_frozen_spec(project_id: str, path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load the frozen (final) spec before planning/building.

    Args:
        project_id: ID for project
        path: optional manual override path

    Returns:
        Frozen spec dict
    """
    target = path or _spec_path(project_id, frozen=True)
    if not os.path.exists(target):
        raise FileNotFoundError(f"[Spec] No frozen spec found for {project_id}")
    with open(target, "r", encoding="utf-8") as f:
        spec = json.load(f)
    return spec


# ----------------------------------------------------------------------------
# Update logic
# ----------------------------------------------------------------------------
def merge_intent(project_id: str, new_intent: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge a new intent extracted from transcript into the live spec.

    Example intent:
        {"type": "feature_request", "data": "Add login page"}
        {"type": "entity", "data": {"name": "Lead", "fields": [["name","text"]]}}
    """
    spec = load_spec(project_id)

    intent_type = new_intent.get("type")
    data = new_intent.get("data")

    if not intent_type or not data:
        log.warning(f"[Spec] Invalid intent: {new_intent}")
        return spec

    if intent_type == "entity":
        _merge_entity(spec, data)
    elif intent_type == "feature_request":
        _merge_page(spec, data)
    elif intent_type == "integration":
        _merge_integration(spec, data)
    elif intent_type == "constraint":
        _merge_constraint(spec, data)
    elif intent_type == "acceptance":
        _merge_acceptance(spec, data)
    else:
        log.warning(f"[Spec] Unknown intent type: {intent_type}")

    save_spec(project_id, spec)
    return spec


def _merge_entity(spec: Dict[str, Any], entity: Dict[str, Any]) -> None:
    existing_names = [e["name"] for e in spec["entities"]]
    if entity["name"] not in existing_names:
        spec["entities"].append(entity)
        log.debug(f"[Spec] Added entity: {entity['name']}")
    else:
        # merge fields if new
        for e in spec["entities"]:
            if e["name"] == entity["name"]:
                existing_fields = [f[0] for f in e.get("fields", [])]
                for f in entity.get("fields", []):
                    if f[0] not in existing_fields:
                        e.setdefault("fields", []).append(f)
                        log.debug(f"[Spec] Added new field to {entity['name']}: {f}")


def _merge_page(spec: Dict[str, Any], page_name: str) -> None:
    if page_name not in spec["pages"]:
        spec["pages"].append(page_name)
        log.debug(f"[Spec] Added page: {page_name}")


def _merge_integration(spec: Dict[str, Any], name: str) -> None:
    if name not in spec["integrations"]:
        spec["integrations"].append(name)
        log.debug(f"[Spec] Added integration: {name}")


def _merge_constraint(spec: Dict[str, Any], text: str) -> None:
    if text not in spec["constraints"]:
        spec["constraints"].append(text)
        log.debug(f"[Spec] Added constraint: {text}")


def _merge_acceptance(spec: Dict[str, Any], text: str) -> None:
    if text not in spec["acceptance"]:
        spec["acceptance"].append(text)
        log.debug(f"[Spec] Added acceptance: {text}")


# ----------------------------------------------------------------------------
# Freeze logic
# ----------------------------------------------------------------------------
def freeze_spec(project_id: str) -> Dict[str, Any]:
    """
    Create an immutable copy of the current spec (snapshot) for planning/building.
    """
    live = load_spec(project_id)
    frozen = copy.deepcopy(live)
    frozen["metadata"]["status"] = "frozen"
    frozen_path = _spec_path(project_id, frozen=True)
    with open(frozen_path, "w", encoding="utf-8") as f:
        json.dump(frozen, f, indent=2)
    log.success(f"[Spec] Frozen spec created → {frozen_path}")
    return frozen
