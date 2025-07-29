# Claude Code Subagents

🤖 67 specialized AI agents for Claude Code development workflows.

[![npm version](https://badge.fury.io/js/claude-code-subagents.svg)](https://badge.fury.io/js/claude-code-subagents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/ersinkoc/claude-code-subagents)](https://github.com/ersinkoc/claude-code-subagents/issues)
[![GitHub stars](https://img.shields.io/github/stars/ersinkoc/claude-code-subagents)](https://github.com/ersinkoc/claude-code-subagents/stargazers)

## What are Subagents?

Specialized AI assistants with focused expertise and isolated context windows:
- **Focused expertise** in specific domains
- **Context preservation** for longer sessions  
- **Automatic invocation** based on task context
- **Project/user level** installation options

## Installation

```bash
npm install -g claude-code-subagents
claude-subagents install --all
```

## Categories

- **Frontend** (6): UI components, accessibility, design
- **Backend** (6): APIs, databases, server architecture  
- **Security** (4): Vulnerability scanning, compliance
- **Testing** (5): Test automation, quality assurance
- **DevOps** (5): CI/CD, monitoring, deployment
- **Performance** (6): Optimization, profiling, caching
- **Documentation** (4): Technical writing, API docs
- **Architecture** (3): System design, microservices
- **Data Analytics** (2): Validation, mock data
- **Utilities** (20): Code tools, formatters, refactoring
- **Creative** (6): Branding, UX research, visual design

## Quick Start

```bash
# Install all agents
claude-subagents install --all

# Install by category  
claude-subagents install --category security

# Install specific agents
claude-subagents install --list code-reviewer security-auditor

# List available agents
claude-subagents list
```

## Usage

Agents are automatically invoked by Claude Code based on context:
```
"Review this authentication function for security issues"
// Automatically uses security-auditor

"Help me optimize this slow database query" 
// Automatically uses performance-optimizer
```

Use `/agents` command in Claude Code to create custom agents.

## CLI Commands

```bash
claude-subagents install --all              # Install all agents
claude-subagents install --category frontend # Install by category
claude-subagents list --search security     # Search agents
claude-subagents info code-reviewer         # Agent details
claude-subagents categories                  # List categories
```

## Agent Storage

- **User-level**: `~/.claude/agents/` (all projects)
- **Project-level**: `.claude/agents/` (current project only)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Support

- 🐛 [Report bugs](https://github.com/ersinkoc/claude-code-subagents/issues)
- 💡 [Request features](https://github.com/ersinkoc/claude-code-subagents/issues)
- ⭐ [Star this project](https://github.com/ersinkoc/claude-code-subagents)

## License

MIT © [Ersin Koc](https://github.com/ersinkoc)