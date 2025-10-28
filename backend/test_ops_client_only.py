"""
Test ops_client.py deployment only
-----------------------------------
Tests the updated ops_client deploy_project function.
Assumes workspace files already exist.

Run: python test_ops_client_only.py
"""

import asyncio
from agents.ops_client import deploy_project
from core.logger import log

async def main():
    print("\n" + "="*70)
    print("🧪 TESTING OPS_CLIENT DEPLOYMENT")
    print("="*70)
    
    # Test with existing test-deploy workspace
    project_id = "test-deploy"
    
    print(f"\nProject: {project_id}")
    print(f"Workspace: data/workspace/{project_id}")
    print("\nThis test will:")
    print("  1. Send message to Agentverse agent")
    print("  2. Wait for repo creation")
    print("  3. Push workspace code to GitHub")
    print("="*70)
    
    try:
        result = await deploy_project(project_id)
        
        print("\n" + "="*70)
        print("📊 RESULT:")
        print("="*70)
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")
        
        if result.get('github_repo'):
            print(f"\n✅ GitHub Repo: {result['github_repo']}")
            print(f"✅ Frontend URL: {result.get('frontend_url', 'N/A')}")
            print(f"✅ Backend URL: {result.get('backend_url', 'N/A')}")
            print("\n🎉 DEPLOYMENT SUCCESSFUL!")
        else:
            print("\n❌ Deployment failed - no repo URL returned")
        
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

