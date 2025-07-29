#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { installAgents, listAgents, getAgentInfo } = require('../src/index');

program
  .name('claude-subagents')
  .description('Claude Code Subagents CLI - Install and manage specialized AI agents')
  .version('1.0.0');

program
  .command('install')
  .description('Install subagents to your Claude Code agents directory')
  .option('-a, --all', 'Install all available agents')
  .option('-c, --category <category>', 'Install agents from specific category')
  .option('-l, --list <agents...>', 'Install specific agents by name')
  .option('-d, --directory <path>', 'Custom installation directory')
  .option('-p, --project', 'Install to project-level .claude/agents/ directory')
  .option('-u, --user', 'Install to user-level ~/.claude/agents/ directory (default)')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Claude Code Subagents Installer\n'));
    
    try {
      await installAgents(options);
      console.log(chalk.green('✅ Installation completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available subagents')
  .option('-c, --category <category>', 'Filter by category')
  .option('-s, --search <term>', 'Search agents by name or description')
  .action(async (options) => {
    try {
      await listAgents(options);
    } catch (error) {
      console.error(chalk.red('❌ Failed to list agents:'), error.message);
      process.exit(1);
    }
  });

program
  .command('info <agent>')
  .description('Get detailed information about a specific agent')
  .action(async (agentName) => {
    try {
      await getAgentInfo(agentName);
    } catch (error) {
      console.error(chalk.red('❌ Failed to get agent info:'), error.message);
      process.exit(1);
    }
  });

program
  .command('categories')
  .description('List all available categories')
  .action(() => {
    const categories = [
      'frontend', 'backend', 'security', 'testing', 'devops',
      'performance', 'documentation', 'architecture', 'data-analytics',
      'utilities', 'creative'
    ];
    
    console.log(chalk.blue('📂 Available Categories:\n'));
    categories.forEach(cat => {
      console.log(chalk.cyan(`  • ${cat}`));
    });
  });

program.parse();