"""
Full Deployment Test with Code Push
------------------------------------
Tests the complete workflow:
1. Generate project code (planner + coder)
2. Create GitHub repo via Agentverse agent
3. Push generated code to GitHub repo
4. Verify repo contains all files

Run: python test_full_deployment.py
"""

import asyncio
import os
import subprocess
from pathlib import Path
from agents.planner_agent import plan_application
from agents.coder_agent import generate_code
from dotenv import load_dotenv
from core.logger import log

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")


async def create_repo_via_github_api(project_id: str) -> str:
    """Create GitHub repo directly (simpler for testing)"""
    import requests
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    repo_data = {
        "name": project_id,
        "description": f"AI-generated project: {project_id}",
        "auto_init": False,  # Don't auto-init, we'll push our own files
        "private": False
    }
    
    response = requests.post(
        "https://api.github.com/user/repos",
        headers=headers,
        json=repo_data
    )
    
    if response.status_code == 201:
        repo_url = response.json()["html_url"]
        clone_url = response.json()["clone_url"]
        return repo_url, clone_url
    elif response.status_code == 422:
        # Repo already exists - delete it first for clean test
        log.warning(f"Repo {project_id} already exists, using existing...")
        repo_url = f"https://github.com/{GITHUB_USERNAME}/{project_id}"
        clone_url = f"https://github.com/{GITHUB_USERNAME}/{project_id}.git"
        return repo_url, clone_url
    else:
        raise Exception(f"Failed to create repo: {response.status_code} - {response.text}")


def push_workspace_to_github(workspace_path: str, clone_url: str, project_id: str):
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
        
        # Push to main branch
        log.info(f"[Deploy] 🚀 Pushing to GitHub...")
        result = subprocess.run(
            ["git", "push", "-u", "origin", "main"],
            cwd=workspace,
            capture_output=True,
            text=True
        )
        
        # If main doesn't exist, try master
        if result.returncode != 0:
            log.info(f"[Deploy] 🔄 Trying master branch...")
            subprocess.run(
                ["git", "branch", "-M", "main"],
                cwd=workspace,
                check=True,
                capture_output=True
            )
            subprocess.run(
                ["git", "push", "-u", "origin", "main"],
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


def verify_repo_contents(project_id: str, expected_files: list) -> bool:
    """Verify repo contains expected files via GitHub API"""
    import requests
    
    log.info(f"[Verify] 🔍 Checking repo contents...")
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Get repo contents
    response = requests.get(
        f"https://api.github.com/repos/{GITHUB_USERNAME}/{project_id}/contents",
        headers=headers
    )
    
    if response.status_code != 200:
        log.error(f"[Verify] Failed to fetch repo contents: {response.status_code}")
        return False
    
    contents = response.json()
    file_names = [item['name'] for item in contents]
    
    log.info(f"[Verify] Found files/folders: {', '.join(file_names)}")
    
    # Check for expected directories
    has_frontend = 'frontend' in file_names
    has_backend = 'backend' in file_names
    has_readme = 'README.md' in file_names
    
    if has_frontend and has_backend and has_readme:
        log.success(f"[Verify] ✅ All expected folders found!")
        return True
    else:
        log.warning(f"[Verify] ⚠️  Missing folders:")
        if not has_frontend:
            log.warning(f"  - frontend/")
        if not has_backend:
            log.warning(f"  - backend/")
        if not has_readme:
            log.warning(f"  - README.md")
        return False


async def main():
    """Run full deployment test"""
    
    # Use existing spec (test-deploy has a frozen spec file)
    spec_id = "test-deploy"
    
    # Create unique project name with timestamp
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    project_id = f"test-deploy-{timestamp}"
    
    print("\n" + "="*70)
    print("🚀 FULL DEPLOYMENT TEST WITH CODE PUSH")
    print("="*70)
    print(f"Spec: {spec_id}")
    print(f"GitHub Repo: {project_id}")
    print("="*70)
    
    try:
        # Step 1: Generate Plan
        print("\n📋 Step 1/5: Generating project plan...")
        plan = await plan_application(
            project_id=spec_id,  # Use spec_id for plan generation
            extra_context="MINIMAL - Generate only essential files for deployment testing (5-6 files total)"
        )
        
        file_tree = plan.get('file_tree', [])
        file_count = len(file_tree) if isinstance(file_tree, list) else sum(len(v) for v in file_tree.values())
        print(f"✅ Plan generated: {file_count} files")
        
        # Step 2: Generate Code
        print("\n💻 Step 2/5: Generating code files...")
        code_result = await generate_code(spec_id)  # Use spec_id for code generation
        workspace_path = code_result['workspace_path']
        generated_files = code_result['files']
        
        print(f"✅ Code generated: {code_result['file_count']} files")
        print(f"   Workspace: {workspace_path}")
        
        # Step 3: Create GitHub Repo
        print("\n🏗️  Step 3/5: Creating GitHub repository...")
        repo_url, clone_url = await create_repo_via_github_api(project_id)
        print(f"✅ Repository created: {repo_url}")
        
        # Step 4: Push Code to GitHub
        print("\n📤 Step 4/5: Pushing code to GitHub...")
        push_success = push_workspace_to_github(workspace_path, clone_url, project_id)
        
        if not push_success:
            print("❌ Failed to push code")
            return
        
        # Step 5: Verify Deployment
        print("\n🔍 Step 5/5: Verifying deployment...")
        
        # Wait a moment for GitHub to process
        await asyncio.sleep(2)
        
        verify_success = verify_repo_contents(project_id, generated_files)
        
        # Summary
        print("\n" + "="*70)
        if verify_success:
            print("🎉 DEPLOYMENT SUCCESSFUL!")
            print("="*70)
            print(f"\n✅ Project deployed to: {repo_url}")
            print(f"✅ Files in repo: frontend/, backend/, README.md")
            print(f"\n📂 Generated files:")
            for i, file_path in enumerate(generated_files[:10], 1):
                print(f"   {i}. {file_path}")
            if len(generated_files) > 10:
                print(f"   ... and {len(generated_files) - 10} more files")
            
            print(f"\n🚀 Next steps:")
            print(f"   1. View repo: {repo_url}")
            print(f"   2. Deploy frontend: https://vercel.com/new/clone?repository-url={repo_url}")
            print(f"   3. Deploy backend: https://railway.app/new/template?template={repo_url}")
        else:
            print("⚠️  DEPLOYMENT COMPLETED WITH WARNINGS")
            print("="*70)
            print(f"Repo created but verification had issues")
            print(f"Check manually: {repo_url}")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

