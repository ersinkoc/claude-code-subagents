const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const glob = require('glob');
const chalk = require('chalk');
const inquirer = require('inquirer');

const CATEGORIES = [
  'frontend', 'backend', 'security', 'testing', 'devops',
  'performance', 'documentation', 'architecture', 'data-analytics',
  'utilities', 'creative'
];

function getClaudeCodeAgentsPath(type = 'user') {
  const homeDir = os.homedir();
  
  if (type === 'project') {
    // Project-level agents: .claude/agents/ in current working directory
    return path.join(process.cwd(), '.claude', 'agents');
  }
  
  // User-level agents: ~/.claude/agents/
  const userAgentsPath = path.join(homeDir, '.claude', 'agents');
  
  // Ensure the directory exists
  if (!fs.existsSync(userAgentsPath)) {
    try {
      fs.ensureDirSync(userAgentsPath);
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not create directory ${userAgentsPath}`));
    }
  }
  
  return userAgentsPath;
}

function getAllAgents() {
  const agentsDir = path.join(__dirname, '..', 'agents');
  const agents = [];

  for (const category of CATEGORIES) {
    const categoryPath = path.join(agentsDir, category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        agents.push({
          name: path.basename(file, '.md'),
          category,
          file: path.join(categoryPath, file)
        });
      }
    }
  }

  return agents;
}

function parseAgentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let name = '';
  let description = '';
  let inFrontMatter = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontMatter = !inFrontMatter;
      continue;
    }
    
    if (inFrontMatter) {
      if (line.startsWith('name:')) {
        name = line.replace('name:', '').trim();
      } else if (line.startsWith('description:')) {
        description = line.replace('description:', '').trim();
      }
    }
  }

  return { name, description, content };
}

async function installAgents(options) {
  const installType = options.project ? 'project' : 'user';
  const targetDir = options.directory || getClaudeCodeAgentsPath(installType);
  const allAgents = getAllAgents();

  // Ensure target directory exists
  await fs.ensureDir(targetDir);

  let agentsToInstall = [];

  if (options.all) {
    agentsToInstall = allAgents;
    console.log(chalk.yellow(`Installing all ${allAgents.length} agents...`));
  } else if (options.category) {
    agentsToInstall = allAgents.filter(agent => agent.category === options.category);
    if (agentsToInstall.length === 0) {
      throw new Error(`No agents found in category: ${options.category}`);
    }
    console.log(chalk.yellow(`Installing ${agentsToInstall.length} agents from ${options.category} category...`));
  } else if (options.list && options.list.length > 0) {
    agentsToInstall = allAgents.filter(agent => options.list.includes(agent.name));
    if (agentsToInstall.length === 0) {
      throw new Error(`No agents found with names: ${options.list.join(', ')}`);
    }
    console.log(chalk.yellow(`Installing ${agentsToInstall.length} specific agents...`));
  } else {
    // Interactive selection
    const { selectedAgents } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedAgents',
      message: 'Select agents to install:',
      choices: allAgents.map(agent => ({
        name: `${chalk.cyan(agent.name)} (${agent.category})`,
        value: agent,
        short: agent.name
      })),
      pageSize: 15
    }]);
    agentsToInstall = selectedAgents;
  }

  if (agentsToInstall.length === 0) {
    console.log(chalk.yellow('No agents selected for installation.'));
    return;
  }

  // Install agents
  let installed = 0;
  for (const agent of agentsToInstall) {
    const targetPath = path.join(targetDir, `${agent.name}.md`);
    
    try {
      await fs.copy(agent.file, targetPath);
      console.log(chalk.green(`  ✓ ${agent.name}`));
      installed++;
    } catch (error) {
      console.log(chalk.red(`  ✗ ${agent.name}: ${error.message}`));
    }
  }

  console.log(chalk.blue(`\n📦 Installed ${installed}/${agentsToInstall.length} agents to: ${targetDir}`));
}

async function listAgents(options = {}) {
  const allAgents = getAllAgents();
  let filteredAgents = allAgents;

  if (options.category) {
    filteredAgents = allAgents.filter(agent => agent.category === options.category);
  }

  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    filteredAgents = filteredAgents.filter(agent => {
      const agentData = parseAgentFile(agent.file);
      return agent.name.toLowerCase().includes(searchTerm) ||
             agentData.description.toLowerCase().includes(searchTerm);
    });
  }

  if (filteredAgents.length === 0) {
    console.log(chalk.yellow('No agents found matching your criteria.'));
    return;
  }

  console.log(chalk.blue(`📋 Available Agents (${filteredAgents.length}):\n`));

  const agentsByCategory = {};
  for (const agent of filteredAgents) {
    if (!agentsByCategory[agent.category]) {
      agentsByCategory[agent.category] = [];
    }
    agentsByCategory[agent.category].push(agent);
  }

  for (const [category, agents] of Object.entries(agentsByCategory)) {
    console.log(chalk.magenta(`\n📂 ${category.toUpperCase()}:`));
    for (const agent of agents) {
      const agentData = parseAgentFile(agent.file);
      console.log(chalk.cyan(`  • ${agent.name}`));
      if (agentData.description) {
        console.log(chalk.gray(`    ${agentData.description.substring(0, 100)}...`));
      }
    }
  }
}

async function getAgentInfo(agentName) {
  const allAgents = getAllAgents();
  const agent = allAgents.find(a => a.name === agentName);

  if (!agent) {
    throw new Error(`Agent not found: ${agentName}`);
  }

  const agentData = parseAgentFile(agent.file);
  
  console.log(chalk.blue(`\n🤖 Agent Information\n`));
  console.log(chalk.cyan(`Name: ${agentData.name || agent.name}`));
  console.log(chalk.cyan(`Category: ${agent.category}`));
  console.log(chalk.cyan(`File: ${agent.file}`));
  
  if (agentData.description) {
    console.log(chalk.cyan(`\nDescription:`));
    console.log(chalk.white(agentData.description));
  }

  console.log(chalk.gray(`\nTo install this agent:`));
  console.log(chalk.gray(`  claude-subagents install -l ${agent.name}`));
}

module.exports = {
  installAgents,
  listAgents,
  getAgentInfo,
  getAllAgents,
  parseAgentFile,
  getClaudeCodeAgentsPath
};