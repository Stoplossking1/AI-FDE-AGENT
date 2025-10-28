"""
Simple test: ONLY test the Planner Agent
-----------------------------------------
Assumes frozen spec already exists at:
  backend/data/specs/ai-dog-dashboard_frozen.json
"""

import asyncio
import json
from agents.planner_agent import plan_application
from core.logger import log


async def test_planner():
    """Test planner agent with pre-created spec."""
    
    project_id = "ai-dog-dashboard"
    
    print("🤖 ========================================")
    print("🤖 TESTING PLANNER AGENT ONLY")
    print("🤖 ========================================\n")
    
    print(f"📋 Loading frozen spec: {project_id}_frozen.json")
    print("⏳ Calling Claude API to generate plan...")
    print("   (This may take 10-30 seconds)\n")
    
    # Call planner agent
    plan = await plan_application(
        project_id=project_id,
        extra_context="AI-native dog health monitoring platform with real-time ML insights"
    )
    
    print("\n✅ PLAN GENERATED SUCCESSFULLY!\n")
    print("=" * 70)
    print("📊 PROJECT PLAN")
    print("=" * 70)
    print(json.dumps(plan, indent=2))
    print("\n")
    
    print("🎉 ========================================")
    print("🎉 PLANNER AGENT TEST COMPLETE!")
    print("🎉 ========================================")
    print(f"\n📁 Plan saved to: backend/data/plans/{project_id}.json\n")
    
    # Print summary
    if "stack" in plan:
        print("📦 Stack:")
        for k, v in plan["stack"].items():
            print(f"   {k}: {v}")
    
    if "tasks" in plan:
        print(f"\n✅ Total tasks: {len(plan['tasks'])}")
        print("   First 5 tasks:")
        for i, task in enumerate(plan["tasks"][:5], 1):
            print(f"   {i}. {task}")


if __name__ == "__main__":
    asyncio.run(test_planner())

