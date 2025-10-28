"""
Test script for FULL BUILD PIPELINE
------------------------------------
Tests the complete flow:
1. Planner Agent: spec → plan
2. Coder Agent: plan → code

Assumes frozen spec exists at:
  backend/data/specs/ai-dog-dashboard_frozen.json
"""

import asyncio
from agents.planner_agent import plan_application
from agents.coder_agent import generate_code
from core.logger import log


async def test_full_pipeline():
    """Test complete build pipeline."""
    
    project_id = "ai-dog-dashboard"
    
    print("🚀 ========================================")
    print("🚀 TESTING FULL BUILD PIPELINE")
    print("🚀 ========================================\n")
    
    try:
        # Step 1: Planner
        print("📋 Step 1/2: Running Planner Agent...")
        print("⏳ Generating project plan...\n")
        
        plan = await plan_application(
            project_id=project_id,
            extra_context="AI-native dog health monitoring platform"
        )
        
        print(f"✅ Plan generated!")
        print(f"   - Stack: {plan['stack']['frontend']} + {plan['stack']['backend']}")
        print(f"   - Entities: {', '.join(plan['entities'])}")
        
        # Handle both list and dict file_tree formats
        file_tree = plan['file_tree']
        file_count = len(file_tree) if isinstance(file_tree, list) else sum(len(files) for files in file_tree.values())
        print(f"   - Files to generate: {file_count}\n")
        
        # Step 2: Coder
        print("💻 Step 2/2: Running Coder Agent...")
        print("⏳ Generating code files...\n")
        
        result = await generate_code(project_id)
        
        print(f"✅ Code generated!")
        print(f"   - Files created: {result['file_count']}")
        print(f"   - Workspace: {result['workspace_path']}\n")
        
        # Summary
        print("=" * 70)
        print("🎉 FULL PIPELINE SUCCESS!")
        print("=" * 70)
        print(f"\n📊 Summary:")
        print(f"   Project ID: {project_id}")
        print(f"   Tech Stack: {plan['stack']['frontend']} + {plan['stack']['backend']}")
        print(f"   Files Generated: {result['file_count']}")
        print(f"   Workspace: {result['workspace_path']}")
        
        print(f"\n📄 Generated files:")
        for i, file_path in enumerate(result['files'], 1):
            print(f"   {i}. {file_path}")
        
        print("\n✅ Your app is ready to run!")
        print(f"   cd {result['workspace_path']}")
        print("   npm install && npm run dev\n")
        
    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(test_full_pipeline())

