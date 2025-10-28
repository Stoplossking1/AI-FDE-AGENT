"""
Minimal Agentverse Agent Test
------------------------------
Tests agent communication step-by-step to isolate issues.

Run: python test_agentverse_minimal.py
"""

import os
import asyncio
from dotenv import load_dotenv
from uagents import Agent, Bureau, Model
from typing import Optional

load_dotenv()

# Configuration
DEPLOYMENT_AGENT_ADDRESS = os.getenv("DEPLOYMENT_AGENT_ADDRESS")
AGENTVERSE_MAILBOX_KEY = os.getenv("AGENTVERSE_MAILBOX_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")

# Message Models
class DeployRequest(Model):
    project_id: str
    github_token: str
    github_username: str

class DeployResponse(Model):
    status: str
    message: str
    github_repo: Optional[str] = None

# Global state
response_received = asyncio.Event()
agent_response = {}


async def test_step_1():
    """Step 1: Verify configuration"""
    print("\n" + "="*60)
    print("STEP 1: Verify Configuration")
    print("="*60)
    
    errors = []
    
    if not DEPLOYMENT_AGENT_ADDRESS:
        errors.append("❌ DEPLOYMENT_AGENT_ADDRESS not set")
    else:
        print(f"✅ DEPLOYMENT_AGENT_ADDRESS: {DEPLOYMENT_AGENT_ADDRESS}")
    
    if not AGENTVERSE_MAILBOX_KEY:
        errors.append("❌ AGENTVERSE_MAILBOX_KEY not set")
    else:
        print(f"✅ AGENTVERSE_MAILBOX_KEY: {AGENTVERSE_MAILBOX_KEY[:50]}...")
    
    if not GITHUB_TOKEN:
        errors.append("❌ GITHUB_TOKEN not set")
    else:
        print(f"✅ GITHUB_TOKEN: {GITHUB_TOKEN[:10]}...")
    
    if not GITHUB_USERNAME:
        errors.append("❌ GITHUB_USERNAME not set")
    else:
        print(f"✅ GITHUB_USERNAME: {GITHUB_USERNAME}")
    
    if errors:
        for error in errors:
            print(error)
        return False
    
    print("\n✅ All configuration verified!")
    return True


async def test_step_2():
    """Step 2: Create agent with mailbox"""
    print("\n" + "="*60)
    print("STEP 2: Create Local Agent with Mailbox")
    print("="*60)
    
    try:
        # Set mailbox API key
        os.environ["AV_API_KEY"] = AGENTVERSE_MAILBOX_KEY
        
        print("📦 Creating agent...")
        agent = Agent(
            name="test_client",
            seed="test_client_seed_12345",
            mailbox=True,
        )
        
        print(f"✅ Agent created successfully!")
        print(f"📍 Agent address: {agent.address}")
        print(f"📍 Agent name: {agent.name}")
        print(f"📬 Mailbox enabled: True")
        
        return agent
        
    except Exception as e:
        print(f"❌ Failed to create agent: {e}")
        import traceback
        traceback.print_exc()
        return None


async def test_step_3(agent):
    """Step 3: Send message to Agentverse agent"""
    print("\n" + "="*60)
    print("STEP 3: Send Message to Agentverse Agent")
    print("="*60)
    
    global response_received, agent_response
    response_received.clear()
    agent_response = {}
    
    # Register response handler
    @agent.on_message(model=DeployResponse)
    async def handle_response(ctx, sender: str, msg: DeployResponse):
        global agent_response, response_received
        print(f"\n📥 RESPONSE RECEIVED!")
        print(f"   From: {sender}")
        print(f"   Status: {msg.status}")
        print(f"   Message: {msg.message}")
        print(f"   Repo: {msg.github_repo}")
        
        agent_response = {
            "status": msg.status,
            "message": msg.message,
            "github_repo": msg.github_repo
        }
        response_received.set()
    
    # Send message on startup
    @agent.on_event("startup")
    async def send_message(ctx):
        print(f"📤 Sending deployment request...")
        print(f"   To: {DEPLOYMENT_AGENT_ADDRESS}")
        print(f"   Project: test-agentverse-integration")
        
        await ctx.send(
            DEPLOYMENT_AGENT_ADDRESS,
            DeployRequest(
                project_id="test-agentverse-integration",
                github_token=GITHUB_TOKEN,
                github_username=GITHUB_USERNAME
            )
        )
        print(f"✅ Message sent!")
    
    try:
        print("🔄 Starting agent bureau...")
        bureau = Bureau()
        bureau.add(agent)
        
        # Run bureau in background
        bureau_task = asyncio.create_task(bureau.run_async())
        
        print("⏳ Waiting for response (60 second timeout)...")
        print("💡 Check your Agentverse agent logs to see if message arrived!")
        
        try:
            await asyncio.wait_for(response_received.wait(), timeout=60.0)
            print("\n✅ SUCCESS! Response received within timeout!")
            return True
            
        except asyncio.TimeoutError:
            print("\n❌ TIMEOUT: No response received in 60 seconds")
            print("\n🔍 Debugging steps:")
            print("   1. Check Agentverse dashboard - is agent running?")
            print("   2. Check Agentverse logs - did it receive the message?")
            print("   3. Check for errors in Agentverse logs")
            return False
            
        finally:
            # Cleanup
            bureau_task.cancel()
            try:
                await bureau_task
            except asyncio.CancelledError:
                pass
            
    except Exception as e:
        print(f"❌ Error during communication: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\n🧪 AGENTVERSE AGENT COMMUNICATION TEST")
    print("="*60)
    print("This test will verify step-by-step that your local agent")
    print("can communicate with your Agentverse deployment agent.")
    print("="*60)
    
    # Step 1: Configuration
    if not await test_step_1():
        print("\n❌ Configuration check failed. Fix your .env file and try again.")
        return
    
    # Step 2: Create agent
    agent = await test_step_2()
    if not agent:
        print("\n❌ Agent creation failed. Check error above.")
        return
    
    # Step 3: Communication
    success = await test_step_3(agent)
    
    # Summary
    print("\n" + "="*60)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("="*60)
        print("\n✅ Your Agentverse integration is working!")
        print(f"✅ GitHub repo: {agent_response.get('github_repo')}")
        print("\n📝 Next steps:")
        print("   - Run full pipeline: python test_full_pipeline.py")
        print("   - Integrate into your application")
    else:
        print("❌ TEST FAILED")
        print("="*60)
        print("\n🔍 Troubleshooting:")
        print("   1. Verify your Agentverse agent is running (green status)")
        print("   2. Check Agentverse logs for incoming messages")
        print("   3. Make sure agent code matches the version I provided")
        print("   4. Verify mailbox key is correct")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())

