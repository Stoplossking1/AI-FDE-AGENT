"""
ops_client.py
─────────────
Client for deploying generated code to GitHub via Agentverse agent.

Flow:
1. Send message to Agentverse agent to create GitHub repo
2. Wait and verify repo was created via GitHub API
3. Push workspace code to repo using git commands
"""

import os
import asyncio
import subprocess
import requests
import time
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from uagents import Agent, Bureau, Model
from core.logger import log

load_dotenv()

# Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
DEPLOYMENT_AGENT_ADDRESS = os.getenv("DEPLOYMENT_AGENT_ADDRESS")
AGENTVERSE_MAILBOX_KEY = os.getenv("AGENTVERSE_MAILBOX_KEY")

# Message Models (must match Agentverse agent)
class DeployRequest(Model):
    project_id: str
    github_token: str
    github_username: str  # Added for constructing repo URLs

class DeployResponse(Model):
    status: str
    message: str
    github_repo: Optional[str] = None

# Global state for response
_deploy_response: Dict[str, Any] = {}
_response_event = asyncio.Event()
_bureau_running = False


def push_workspace_to_github(workspace_path: str, clone_url: str, project_id: str) -> bool:
    """Push workspace files to GitHub using git commands"""
    
    workspace = Path(workspace_path)
    
    if not workspace.exists():
        raise Exception(f"Workspace not found: {workspace_path}")
    
    log.info(f"[Deploy] 📦 Preparing to push {workspace_path} to GitHub...")
    
    # Create authenticated clone URL
    auth_clone_url = clone_url.replace(
        "https://",
        f"https://{GITHUB_USERNAME}:{GITHUB_TOKEN}@"
    )
    
    try:
        # Remove existing .git folder if it exists
        git_dir = workspace / ".git"
        if git_dir.exists():
            log.info(f"[Deploy] 🗑️  Removing existing .git folder...")
            shutil.rmtree(git_dir)
        
        # Initialize git repo
        log.info(f"[Deploy] 🔧 Initializing git repository...")
        subprocess.run(["git", "init"], cwd=workspace, check=True, capture_output=True)
        
        # Configure git
        subprocess.run(
            ["git", "config", "user.name", "AI-FDE"],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        subprocess.run(
            ["git", "config", "user.email", "ai-fde@example.com"],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        
        # Add all files
        log.info(f"[Deploy] 📝 Staging files...")
        subprocess.run(["git", "add", "."], cwd=workspace, check=True, capture_output=True)
        
        # Commit
        log.info(f"[Deploy] 💾 Committing files...")
        subprocess.run(
            ["git", "commit", "-m", "Initial commit - AI-generated project"],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        
        # Add remote
        log.info(f"[Deploy] 🔗 Adding remote origin...")
        subprocess.run(
            ["git", "remote", "add", "origin", auth_clone_url],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        
        # Push to main branch (force push to handle auto-init README)
        log.info(f"[Deploy] 🚀 Pushing to GitHub...")
        subprocess.run(
            ["git", "branch", "-M", "main"],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        subprocess.run(
            ["git", "push", "-u", "origin", "main", "--force"],
            cwd=workspace,
            check=True,
            capture_output=True
        )
        
        log.success(f"[Deploy] ✅ Code pushed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        log.error(f"[Deploy] ❌ Git error: {e}")
        if e.stderr:
            log.error(f"[Deploy] Error output: {e.stderr.decode()}")
        return False
    except Exception as e:
        log.error(f"[Deploy] ❌ Push error: {e}")
        return False


def verify_repo_exists(project_id: str, max_retries: int = 5) -> Optional[str]:
    """Verify GitHub repo exists by polling the API"""
    
    log.info(f"[Deploy] 🔍 Verifying repo creation...")
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    repo_url = f"https://github.com/{GITHUB_USERNAME}/{project_id}"
    api_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{project_id}"
    
    for attempt in range(max_retries):
        try:
            response = requests.get(api_url, headers=headers)
            
            if response.status_code == 200:
                repo_data = response.json()
                clone_url = repo_data["clone_url"]
                log.success(f"[Deploy] ✅ Repo verified: {repo_url}")
                return clone_url
            elif response.status_code == 404:
                if attempt < max_retries - 1:
                    log.info(f"[Deploy] ⏳ Repo not found yet, waiting... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(2)
                else:
                    log.error(f"[Deploy] ❌ Repo not found after {max_retries} attempts")
                    return None
            else:
                log.error(f"[Deploy] ❌ GitHub API error: {response.status_code}")
                return None
                
        except Exception as e:
            log.error(f"[Deploy] ❌ Verification error: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
    
    return None


async def deploy_project(project_id: str) -> Dict[str, Any]:
    """
    Deploy a project via Agentverse agent with code push.
    
    Flow:
    1. Send message to Agentverse agent to create repo
    2. Wait and verify repo exists via GitHub API
    3. Push workspace code to repo using git
    
    Args:
        project_id: Project identifier (e.g. 'test-deploy')
        
    Returns:
        Deployment result with GitHub repo URL and deployment instructions
    """
    
    # Validate configuration
    if not GITHUB_TOKEN:
        raise EnvironmentError("GITHUB_TOKEN not set in .env")
    
    if not GITHUB_USERNAME:
        raise EnvironmentError("GITHUB_USERNAME not set in .env")
    
    if not DEPLOYMENT_AGENT_ADDRESS:
        raise EnvironmentError("DEPLOYMENT_AGENT_ADDRESS not set in .env")
    
    if not AGENTVERSE_MAILBOX_KEY:
        raise EnvironmentError("AGENTVERSE_MAILBOX_KEY not set in .env")
    
    log.info(f"[Ops] 🚀 Deploying {project_id} via Agentverse agent...")
    log.info(f"[Ops] 📤 Target agent: {DEPLOYMENT_AGENT_ADDRESS}")
    
    workspace_path = f"data/workspace/{project_id}"
    
    try:
        # Step 1: Send message to Agentverse agent to create repo
        os.environ["AV_API_KEY"] = AGENTVERSE_MAILBOX_KEY
        
        client_agent = Agent(
            name="deploy_client",
            seed="deploy_client_fixed_seed_12345",
            mailbox=True,
        )
        
        log.info(f"[Ops] 📍 Client agent: {client_agent.address}")
        
        @client_agent.on_event("startup")
        async def send_request(ctx):
            log.info(f"[Ops] 📤 Requesting repo creation...")
            await ctx.send(
                DEPLOYMENT_AGENT_ADDRESS,
                DeployRequest(
                    project_id=project_id,
                    github_token=GITHUB_TOKEN,
                    github_username=GITHUB_USERNAME
                )
            )
            log.info(f"[Ops] ✅ Message sent to Agentverse agent")
        
        # Start agent briefly to send message
        bureau = Bureau()
        bureau.add(client_agent)
        bureau_task = asyncio.create_task(bureau.run_async())
        
        # Give agent time to send message
        await asyncio.sleep(3)
        
        # Cancel bureau
        bureau_task.cancel()
        try:
            await bureau_task
        except asyncio.CancelledError:
            pass
        
        log.info(f"[Ops] ⏳ Waiting for Agentverse agent to create repo...")
        
        # Step 2: Wait and verify repo exists
        await asyncio.sleep(8)  # Give agent time to process
        clone_url = verify_repo_exists(project_id, max_retries=5)
        
        if not clone_url:
            return {
                "status": "error",
                "message": "Failed to create GitHub repo - check Agentverse logs"
            }
        
        repo_url = f"https://github.com/{GITHUB_USERNAME}/{project_id}"
        
        # Step 3: Push workspace code to repo
        log.info(f"[Ops] 📤 Pushing code to repository...")
        push_success = push_workspace_to_github(workspace_path, clone_url, project_id)
        
        if not push_success:
            return {
                "status": "partial",
                "message": "Repo created but code push failed",
                "github_repo": repo_url
            }
        
        # Success!
        log.success(f"[Ops] ✅ Deployment complete: {repo_url}")
        
        return {
            "status": "success",
            "message": "Repository created and code pushed successfully",
            "github_repo": repo_url,
            "clone_url": clone_url,
            "frontend_url": f"https://vercel.com/new/clone?repository-url={repo_url}",
            "backend_url": f"https://railway.app/new/template?template={repo_url}",
        }
            
    except Exception as e:
        log.error(f"[Ops] ❌ Deployment error: {e}")
        import traceback
        log.error(f"[Ops] 📋 Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e)
        }


async def check_deployment_status(project_id: str) -> Dict[str, Any]:
    """
    Check if a GitHub repo exists for the project.
    
    Args:
        project_id: Project identifier
        
    Returns:
        Status information
    """
    
    if not GITHUB_USERNAME:
        return {"status": "error", "message": "GITHUB_USERNAME not set"}
    
    try:
        repo_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{project_id}"
        headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}
        
        response = requests.get(repo_url, headers=headers)
        
        if response.status_code == 200:
            repo_info = response.json()
            return {
                "status": "deployed",
                "github_repo": repo_info["html_url"],
                "created_at": repo_info["created_at"]
            }
        else:
            return {
                "status": "not_deployed",
                "message": "Repository does not exist"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
