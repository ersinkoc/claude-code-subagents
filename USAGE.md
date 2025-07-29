# Usage Guide - Claude Code Subagents

## Quick Start

### Installation
```bash
npm install -g claude-code-subagents
```

### Basic Usage
```bash
# Install all agents to user directory (~/.claude/agents/)
claude-subagents install --all

# Install specific agents
claude-subagents install --list code-reviewer security-auditor test-writer

# Install by category
claude-subagents install --category frontend

# Install to project directory (.claude/agents/)
claude-subagents install --all --project
```

## Directory Structure

Claude Code looks for subagents in these locations:

```
📁 Project Level (highest priority)
  .claude/agents/
    ├── code-reviewer.md
    ├── security-auditor.md
    └── ...

📁 User Level (global access)
  ~/.claude/agents/
    ├── frontend-developer.md
    ├── api-architect.md
    └── ...
```

## CLI Commands

### `install` - Install subagents
```bash
# Install all agents
claude-subagents install --all

# Install specific agents
claude-subagents install --list code-reviewer security-auditor

# Install by category
claude-subagents install --category security

# Install to project directory
claude-subagents install --all --project

# Install to custom directory
claude-subagents install --all --directory /path/to/agents
```

### `list` - Browse available agents
```bash
# List all agents
claude-subagents list

# Filter by category
claude-subagents list --category frontend

# Search by name or description
claude-subagents list --search "security"
```

### `info` - Get agent details
```bash
# Get detailed information about an agent
claude-subagents info code-reviewer
```

### `categories` - Show all categories
```bash
# List available categories
claude-subagents categories
```

## Using Subagents in Claude Code

### Method 1: Automatic invocation
Claude Code automatically selects subagents based on context:
```
I need to review this authentication function for security issues
// Claude automatically uses security-auditor subagent
```

### Method 2: Explicit invocation
```
Use the code-reviewer subagent to analyze this function:
function authenticate(username, password) {
  // Your code here
}
```

### Method 3: Creating subagents
Use `/agents` command in Claude Code to create or manage subagents

## Agent Categories

### 🎨 Frontend Development
- `frontend-developer` - React, Vue, Angular development
- `ui-designer` - UI/UX design and components
- `accessibility-auditor` - WCAG compliance and accessibility

### 🔧 Backend Development  
- `backend-architect` - Server architecture and design
- `api-architect` - RESTful API design and best practices
- `database-architect` - Database design and optimization

### 🛡️ Security
- `security-auditor` - Security vulnerability assessment
- `security-vulnerability-scanner` - Automated security scanning
- `compliance-legal-auditor` - Regulatory compliance (GDPR, CCPA)

### 🧪 Testing
- `test-writer` - Unit, integration, and E2E test creation
- `test-suite-developer` - Test framework setup and configuration
- `api-tester` - API testing and validation

### 🚀 DevOps
- `devops-automator` - CI/CD pipeline automation
- `environment-config-specialist` - Environment setup and configuration
- `monitoring-observability-expert` - Logging and monitoring setup

### ⚡ Performance
- `performance-optimizer` - Code and system optimization
- `algorithm-optimizer` - Algorithm efficiency improvements
- `caching-strategy-architect` - Caching implementation strategies

### 📚 Documentation
- `documentation-specialist` - Technical documentation creation
- `prd-writer` - Product requirements documentation
- `technical-documentation-writer` - API docs, guides, tutorials

## Best Practices

### 1. Choose the Right Agent
```bash
# For code review tasks
claude-subagents install --list code-reviewer

# For security analysis
claude-subagents install --list security-auditor

# For frontend work  
claude-subagents install --category frontend
```

### 2. Project vs User Installation
```bash
# Project-specific agents (team consistency)
claude-subagents install --project --category security

# Personal agents (across all projects)
claude-subagents install --user --list code-reviewer performance-optimizer
```

### 3. Agent Combinations
Use multiple agents for comprehensive analysis:
1. `code-reviewer` for general code quality
2. `security-auditor` for security analysis  
3. `performance-optimizer` for performance tuning
4. `test-writer` for test coverage

## Troubleshooting

### Agent Not Found
```bash
# Verify installation
claude-subagents list --search "agent-name"

# Check installation directory
ls ~/.claude/agents/
ls .claude/agents/
```

### Permission Issues
```bash
# Create directories manually
mkdir -p ~/.claude/agents
mkdir -p .claude/agents

# Install with explicit directory
claude-subagents install --directory ~/.claude/agents --all
```

### Agent Updates
```bash
# Reinstall agents to get updates
claude-subagents install --all --force
```

## Examples

### Web Development Workflow
```bash
# Install frontend development stack
claude-subagents install --category frontend
claude-subagents install --list security-auditor test-writer

# In Claude Code:
# 1. Use frontend-developer for component creation
# 2. Use security-auditor for security review
# 3. Use test-writer for test creation
```

### API Development Workflow
```bash
# Install backend development stack
claude-subagents install --category backend --category security
claude-subagents install --list api-tester documentation-specialist

# In Claude Code:
# 1. Use api-architect for API design
# 2. Use security-auditor for security analysis
# 3. Use api-tester for testing
# 4. Use documentation-specialist for API docs
```

### Code Review Workflow
```bash
# Install code quality stack
claude-subagents install --list code-reviewer security-auditor performance-optimizer

# In Claude Code:
# 1. Use code-reviewer for general review
# 2. Use security-auditor for security focus
# 3. Use performance-optimizer for performance analysis
```