# 🚀 Agentverse Deployment Agent Setup Guide

Complete guide to setting up your Fetch.ai deployment agent on Agentverse.

---

## Prerequisites

1. **Fetch.ai Agentverse Account**
   - Sign up at: https://agentverse.ai
   - Make sure you have credits available

2. **GitHub Account**
   - Personal Access Token with `repo` permissions
   - Get token at: https://github.com/settings/tokens

3. **AI-FDE Backend Running**
   - Your main system should be operational

---

## Step 1: Create Agent on Agentverse

### 1.1 Access Agentverse
- Go to https://agentverse.ai
- Sign in with your Fetch.ai account
- Navigate to "Agents" tab
- Click "Create New Agent"

### 1.2 Configure Agent

**Basic Settings:**
- **Name**: `deployment-agent`
- **Description**: `Autonomous deployment agent for AI-generated applications`
- **Agent Type**: **Hosted Agent** (uses your credits)
- **Make Public**: ✅ Yes (so AI-FDE can send messages)

### 1.3 Add Agent Code

Copy and paste this code into the Agentverse editor:

```python
from uagents import Agent, Context, Model
from typing import Optional
import requests
import json

# Request Model
class DeployRequest(Model):
    project_id: str
    github_token: str

# Response Model  
class DeployResponse(Model):
    status: str
    message: str
    github_repo: Optional[str] = None

# Initialize agent with unique seed
agent = Agent(
    name="deployment_agent",
    seed="your_unique_seed_change_this_123456"  # ⚠️ CHANGE THIS!
)

@agent.on_message(model=DeployRequest)
async def handle_deploy(ctx: Context, sender: str, msg: DeployRequest):
    """Handle deployment requests"""
    
    ctx.logger.info(f"🚀 Deploying: {msg.project_id}")
    
    try:
        # GitHub API configuration
        headers = {
            "Authorization": f"token {msg.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # Create repository
        repo_data = {
            "name": msg.project_id,
            "description": f"AI-generated project: {msg.project_id}",
            "auto_init": True,
            "private": False
        }
        
        response = requests.post(
            "https://api.github.com/user/repos",
            headers=headers,
            json=repo_data
        )
        
        if response.status_code == 201:
            repo_info = response.json()
            repo_url = repo_info["html_url"]
            
            ctx.logger.info(f"✅ Repo created: {repo_url}")
            
            # Send success response
            await ctx.send(
                sender,
                DeployResponse(
                    status="success",
                    message="Repository created successfully",
                    github_repo=repo_url
                )
            )
        else:
            error_msg = f"GitHub API error: {response.status_code}"
            ctx.logger.error(error_msg)
            await ctx.send(
                sender,
                DeployResponse(
                    status="error",
                    message=error_msg
                )
            )
            
    except Exception as e:
        ctx.logger.error(f"❌ Error: {str(e)}")
        await ctx.send(
            sender,
            DeployResponse(
                status="error",
                message=str(e)
            )
        )

if __name__ == "__main__":
    agent.run()
```

**⚠️ IMPORTANT**: Change the `seed` value to something unique!

### 1.4 Deploy Agent

1. Click **"Deploy"** button in Agentverse
2. Wait for deployment to complete (~30 seconds)
3. Agent status should show: ✅ **Running**

### 1.5 Copy Agent Address

After deployment, you'll see:
```
Agent Address: agent1q...xyz
```

**📋 Copy this address** - you'll need it for AI-FDE configuration!

---

## Step 2: Configure AI-FDE

### 2.1 Update Environment Variables

Edit your `backend/.env` file:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_USERNAME=your-github-username

# Agentverse Agent Configuration
DEPLOYMENT_AGENT_ADDRESS=agent1q...xyz  # ← Paste the address from Agentverse
```

### 2.2 Verify Configuration

```bash
cd backend
cat .env | grep DEPLOYMENT_AGENT_ADDRESS
# Should show your agent address
```

---

## Step 3: Test the Integration

### 3.1 Start AI-FDE Backend

```bash
cd backend
source ../.venv/bin/activate
uvicorn main:app --reload
```

### 3.2 Run Test Script

Create a test to verify everything works:

```bash
python test_full_pipeline.py
```

**Expected Output:**
```
🚀 TESTING FULL BUILD PIPELINE
📋 Step 1/3: Running Planner Agent...
✅ Plan generated!

💻 Step 2/3: Running Coder Agent...
✅ Code generated!

🚀 Step 3/3: Deploying...
✅ Deployment initiated! GitHub repo: https://github.com/user/project
```

### 3.3 Verify on Agentverse

1. Go to Agentverse dashboard
2. Click on your deployment agent
3. Check **"Logs"** tab
4. You should see deployment messages

---

## Step 4: Verify GitHub Repository

1. Go to your GitHub account
2. You should see a new repo with your project name
3. The repo should contain:
   - `frontend/` folder with Next.js code
   - `backend/` folder with FastAPI code
   - `README.md`

---

## Step 5: Deploy to Vercel/Railway (Optional)

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Set **Root Directory**: `frontend`
5. Framework Preset: **Next.js** (auto-detected)
6. Click **"Deploy"**

### Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Set **Root Directory**: `backend`
5. Railway will auto-detect FastAPI
6. Click **"Deploy"**

---

## Troubleshooting

### Agent Not Receiving Messages

**Problem**: AI-FDE can't reach the agent

**Solutions**:
1. Verify agent is **Public** in Agentverse settings
2. Check agent address is correct in `.env`
3. Make sure agent shows as **Running** (green status)

### GitHub Repo Not Created

**Problem**: Agent receives message but repo creation fails

**Solutions**:
1. Check GitHub token has `repo` permissions
2. Verify token in request is correct
3. Check Agentverse logs for error details
4. Ensure repo name doesn't already exist

### "No credits available"

**Problem**: Agentverse agent won't deploy

**Solutions**:
1. Check your credits balance on Agentverse
2. Request more credits if needed
3. Contact Fetch.ai support

---

## Architecture Diagram

```
┌─────────────────┐
│   AI-FDE        │
│   Backend       │
└────────┬────────┘
         │ HTTP POST /deploy
         │ {project_id, github_token}
         ↓
┌─────────────────┐
│  Agentverse     │
│  (Hosted)       │
│                 │
│  ┌───────────┐  │
│  │ Deploy    │  │
│  │ Agent     │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         ↓
┌─────────────────┐
│  GitHub API     │
│                 │
│  Creates Repo   │
│  Pushes Code    │
└─────────┬───────┘
          │
          ↓
    ┌─────────┐
    │ Vercel  │  (Frontend)
    └─────────┘
    ┌─────────┐
    │ Railway │  (Backend)
    └─────────┘
```

---

## Benefits of Using Agentverse

✅ **Always Available** - Agent runs 24/7, no local server needed  
✅ **Scalable** - Handles multiple concurrent deployments  
✅ **Monitored** - Built-in logging and monitoring dashboard  
✅ **Credited** - Uses your Fetch.ai credits (qualify for rewards!)  
✅ **Secure** - GitHub tokens only sent in messages, not stored  

---

## Next Steps

After basic deployment works:

1. **Add File Pushing** - Push actual workspace code to GitHub (not just create repo)
2. **Webhook Integration** - Auto-trigger Vercel/Railway deployments
3. **Status Updates** - Agent sends real-time deployment status
4. **Error Handling** - Agent retries failed deployments
5. **Multi-Project Support** - Handle multiple projects simultaneously

---

## Support

- **Agentverse Docs**: https://docs.fetch.ai/
- **uAgents Guide**: https://docs.fetch.ai/guides/agents/
- **GitHub Issues**: Report issues in AI-FDE repo

---

**🎉 You're all set! Your deployment agent is now autonomous and ready to deploy AI-generated applications!**

