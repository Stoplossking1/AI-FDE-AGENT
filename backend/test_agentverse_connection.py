"""
Test script to verify Agentverse agent connection
-------------------------------------------------
This script tests:
1. Environment variables are set correctly
2. uAgents library is installed
3. Can create a local agent
4. Configuration is valid

Run: python test_agentverse_connection.py
"""

import os
import sys
from dotenv import load_dotenv

print("🧪 Testing Agentverse Integration Setup")
print("=" * 60)

# Test 1: Load environment variables
print("\n1️⃣  Loading environment variables...")
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
DEPLOYMENT_AGENT_ADDRESS = os.getenv("DEPLOYMENT_AGENT_ADDRESS")

if not GITHUB_TOKEN:
    print("   ❌ GITHUB_TOKEN not set in .env")
    sys.exit(1)
else:
    print(f"   ✅ GITHUB_TOKEN found (starts with: {GITHUB_TOKEN[:7]}...)")

if not GITHUB_USERNAME:
    print("   ❌ GITHUB_USERNAME not set in .env")
    sys.exit(1)
else:
    print(f"   ✅ GITHUB_USERNAME: {GITHUB_USERNAME}")

if not DEPLOYMENT_AGENT_ADDRESS:
    print("   ❌ DEPLOYMENT_AGENT_ADDRESS not set in .env")
    sys.exit(1)
else:
    print(f"   ✅ DEPLOYMENT_AGENT_ADDRESS: {DEPLOYMENT_AGENT_ADDRESS}")

# Test 2: Import uAgents
print("\n2️⃣  Testing uAgents library...")
try:
    from uagents import Agent, Model, Bureau
    print(f"   ✅ uAgents imported successfully")
except ImportError as e:
    print(f"   ❌ Failed to import uAgents: {e}")
    print("   💡 Run: pip install uagents")
    sys.exit(1)

# Test 3: Create a test agent
print("\n3️⃣  Creating test agent...")
try:
    test_agent = Agent(
        name="connection_test",
        seed="test_agent_seed_12345",
    )
    print(f"   ✅ Test agent created")
    print(f"   📍 Agent address: {test_agent.address}")
except Exception as e:
    print(f"   ❌ Failed to create agent: {e}")
    sys.exit(1)

# Test 4: Validate agent address format
print("\n4️⃣  Validating deployment agent address...")
if DEPLOYMENT_AGENT_ADDRESS.startswith("agent1"):
    print(f"   ✅ Agent address format looks correct")
else:
    print(f"   ⚠️  Warning: Agent address doesn't start with 'agent1'")
    print(f"      Address: {DEPLOYMENT_AGENT_ADDRESS}")
    print(f"      This might not be a valid Fetch.ai agent address")

# Test 5: Test GitHub API connection
print("\n5️⃣  Testing GitHub API connection...")
try:
    import requests
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    response = requests.get("https://api.github.com/user", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"   ✅ GitHub API connection successful")
        print(f"   👤 Logged in as: {user_data.get('login')}")
        print(f"   📊 Public repos: {user_data.get('public_repos')}")
    else:
        print(f"   ❌ GitHub API error: {response.status_code}")
        print(f"   💡 Check your GITHUB_TOKEN permissions")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ Error connecting to GitHub: {e}")
    sys.exit(1)

# Summary
print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED!")
print("=" * 60)
print("\nYour Agentverse integration is configured correctly!")
print("\nNext steps:")
print("  1. Run: python test_full_pipeline.py")
print("  2. Check Agentverse dashboard for incoming messages")
print("  3. Verify GitHub repo is created")
print("\n🚀 Ready to deploy!")

