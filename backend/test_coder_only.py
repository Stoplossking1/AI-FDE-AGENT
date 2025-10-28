"""
Test script to run ONLY the Coder Agent
-----------------------------------------
Assumes plan already exists at:
  backend/data/plans/ai-dog-dashboard.json
"""

import asyncio
from agents.coder_agent import generate_code
from core.logger import log


async def test_coder():
    """Test coder agent with existing plan."""
    
    project_id = "ai-dog-dashboard"
    
    print("🤖 ========================================")
    print("🤖 TESTING CODER AGENT ONLY")
    print("🤖 ========================================\n")
    
    print(f"📋 Using plan: {project_id}.json")
    print("⏳ Generating code files...\n")
    
    # Call coder agent
    result = await generate_code(project_id)
    
    print("\n✅ CODE GENERATION COMPLETE!\n")
    print("=" * 70)
    print("📊 RESULTS")
    print("=" * 70)
    
    print(f"\n✅ Files created: {result['file_count']}")
    print(f"❌ Files failed: {result['failed_count']}")
    print(f"📁 Workspace: {result['workspace_path']}")
    
    print("\n📄 Generated files:")
    for i, file_path in enumerate(result['files'], 1):
        print(f"   {i}. {file_path}")
    
    print("\n🎉 ========================================")
    print("🎉 CODER AGENT TEST COMPLETE!")
    print("🎉 ========================================\n")


if __name__ == "__main__":
    asyncio.run(test_coder())

