# 🚀 Agentverse Integration Setup

This guide will help you configure your AI-FDE backend to communicate with your Agentverse deployment agent.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. ✅ Agentverse account at https://agentverse.ai
2. ✅ Deployment agent created and running on Agentverse
3. ✅ Agent address (format: `agent1q...`)
4. ✅ GitHub Personal Access Token with `repo` permissions
5. ✅ uAgents library installed (`pip install uagents`)

---

## 📋 Step 1: Create .env File

Create a file named `.env` in the `backend/` directory:

```bash
cd backend
touch .env
```

Add the following configuration:

```bash
# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_USERNAME=your-github-username

# Agentverse Deployment Agent
DEPLOYMENT_AGENT_ADDRESS=agent1q0v4mmka5y8vrpvztv25rze55nedx4xdsfndcl4nz0jflfwqpwu55369s69
```

### Getting Your GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Classic"
3. Give it a name: "AI-FDE Deployment"
4. Select scope: **`repo`** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Getting Your Agent Address

1. Go to https://agentverse.ai
2. Navigate to your deployment agent
3. Copy the agent address (starts with `agent1q...`)
4. Paste it into the `DEPLOYMENT_AGENT_ADDRESS` field

---

## 📋 Step 2: Verify Installation

Check that uAgents is installed:

```bash
cd /path/to/AI-FDE
source venv/bin/activate
python -c "import uagents; print(f'✅ uAgents v{uagents.__version__} installed')"
```

Expected output:
```
✅ uAgents v0.22.10 installed
```

---

## 📋 Step 3: Test the Integration

Run the full pipeline test:

```bash
cd backend
python test_full_pipeline.py
```

### Expected Output

```
🚀 ========================================
🚀 TESTING FULL BUILD PIPELINE
🚀 ========================================

📋 Step 1/3: Running Planner Agent...
⏳ Generating project plan...

✅ Plan generated!
   - Stack: Next.js + FastAPI
   - Entities: user, deployment
   - Files to generate: 8

💻 Step 2/3: Running Coder Agent...
⏳ Generating code files...

✅ Code generated!
   - Files created: 8
   - Workspace: backend/data/workspace/test-deploy

🚀 Step 3/3: Deploying to GitHub via Agentverse...
⏳ Sending request to deployment agent...

[Ops] 🚀 Deploying test-deploy via Agentverse agent...
[Ops] 📤 Target agent: agent1q0v4mmka5y8vrpvztv25rze55nedx4xdsfndcl4nz0jflfwqpwu55369s69
[Ops] 📤 Sending deploy request...
[Ops] 📥 Response received: success

✅ Deployment successful!
   - GitHub Repo: https://github.com/yourusername/test-deploy
   - Message: Repository created successfully

======================================================================
🎉 FULL PIPELINE SUCCESS!
======================================================================
```

---

## 🔧 Troubleshooting

### Issue 1: "DEPLOYMENT_AGENT_ADDRESS not set in .env"

**Solution**: Make sure your `.env` file exists in the `backend/` directory and contains the `DEPLOYMENT_AGENT_ADDRESS` variable.

```bash
cd backend
cat .env | grep DEPLOYMENT_AGENT_ADDRESS
```

### Issue 2: "Timeout waiting for agent response"

**Possible causes:**
1. ❌ Agent not running on Agentverse
2. ❌ Agent address is incorrect
3. ❌ Agent is not set to "Public" (if that setting exists)
4. ❌ Network connectivity issues

**Solutions:**
1. Check Agentverse dashboard - agent should show "Running" status
2. Verify the agent address is correct (copy it again from Agentverse)
3. Check your internet connection
4. Check Agentverse logs for incoming messages

### Issue 3: "GitHub API error 401"

**Solution**: Your GitHub token is invalid or expired.

1. Generate a new token at https://github.com/settings/tokens
2. Make sure it has `repo` permissions
3. Update your `.env` file with the new token

### Issue 4: "GitHub API error 422"

**Solution**: Repository already exists with that name.

This is actually OK! The deployment considers it a success and uses the existing repo.

---

## 🎯 How It Works

```
┌─────────────────────┐
│   AI-FDE Backend    │
│   (ops_client.py)   │
└──────────┬──────────┘
           │
           │ 1. Create local uAgent
           │ 2. Send DeployRequest message
           │    {project_id, github_token}
           ↓
┌─────────────────────┐
│   Agentverse        │
│   (Hosted Agent)    │
│                     │
│  ┌───────────────┐  │
│  │ Deployment    │  │
│  │ Agent         │  │
│  │               │  │
│  │ - Receives    │  │
│  │   message     │  │
│  │ - Calls       │  │
│  │   GitHub API  │  │
│  │ - Creates repo│  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           │ 3. Send DeployResponse
           │    {status, github_repo}
           ↓
┌─────────────────────┐
│   Local Agent       │
│   Receives response │
│   Returns result    │
└─────────────────────┘
```

---

## 📚 Next Steps

Once the basic integration works:

1. **Push Code to GitHub** - Currently only creates empty repos. Next: push generated workspace files
2. **Vercel/Railway Integration** - Auto-trigger deployments after repo creation
3. **Status Updates** - Real-time deployment progress updates
4. **Error Handling** - Better retry logic and error messages
5. **Multi-Project Support** - Handle multiple concurrent deployments

---

## 🆘 Still Having Issues?

1. Check Agentverse logs:
   - Go to https://agentverse.ai
   - Click on your agent
   - View the "Logs" tab
   - Look for incoming messages and errors

2. Enable debug logging in `ops_client.py`:
   ```python
   # Add at the top of ops_client.py
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

3. Test GitHub API directly:
   ```bash
   curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
        https://api.github.com/user
   ```
   Should return your GitHub user info.

4. Create a GitHub issue in the AI-FDE repository with:
   - Error message
   - Agentverse logs
   - Your configuration (WITHOUT tokens!)

---

**✅ You're all set! Your AI-FDE backend is now integrated with Agentverse for autonomous deployments!**

