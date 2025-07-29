const fs = require('fs-extra');
const chalk = require('chalk');
const { getAllAgents } = require('./index');

function validateAgentFile(agentPath) {
  const errors = [];
  const warnings = [];
  
  try {
    const content = fs.readFileSync(agentPath, 'utf8');
    const lines = content.split('\n');
    
    // Check for front matter
    let hasFrontMatter = false;
    let frontMatterComplete = false;
    let frontMatterCount = 0;
    let hasName = false;
    let hasDescription = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '---') {
        frontMatterCount++;
        if (frontMatterCount === 1) {
          hasFrontMatter = true;
        } else if (frontMatterCount === 2) {
          frontMatterComplete = true;
          break;
        }
      }
      
      if (hasFrontMatter && frontMatterCount === 1) {
        if (line.startsWith('name:')) {
          hasName = true;
          const name = line.replace('name:', '').trim();
          if (!name) {
            errors.push('Name field is empty');
          }
        }
        if (line.startsWith('description:')) {
          hasDescription = true;
          const desc = line.replace('description:', '').trim();
          if (!desc) {
            errors.push('Description field is empty');
          } else if (desc.length < 50) {
            warnings.push('Description is very short (< 50 characters)');
          }
        }
      }
    }
    
    if (!hasFrontMatter) {
      errors.push('Missing front matter (--- at start of file)');
    } else if (!frontMatterComplete) {
      errors.push('Front matter not properly closed (missing second ---)');
    }
    
    if (!hasName) {
      errors.push('Missing name field in front matter');
    }
    
    if (!hasDescription) {
      errors.push('Missing description field in front matter');
    }
    
    // Check content length
    if (content.length < 500) {
      warnings.push('Agent content is quite short (< 500 characters)');
    }
    
    // Check for system prompt content
    const systemPromptIndicators = [
      'you are', 'your role', 'when reviewing', 'your task',
      'you will', 'you should', 'always provide'
    ];
    
    const hasSystemPrompt = systemPromptIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (!hasSystemPrompt) {
      warnings.push('Agent may be missing clear system prompt instructions');
    }
    
  } catch (error) {
    errors.push(`Failed to read file: ${error.message}`);
  }
  
  return { errors, warnings };
}

function validateAllAgents() {
  console.log(chalk.blue('🔍 Validating all subagent files...\n'));
  
  const agents = getAllAgents();
  let totalErrors = 0;
  let totalWarnings = 0;
  let validAgents = 0;
  
  for (const agent of agents) {
    const validation = validateAgentFile(agent.file);
    
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log(chalk.green(`✓ ${agent.name} (${agent.category})`));
      validAgents++;
    } else {
      console.log(chalk.yellow(`⚠ ${agent.name} (${agent.category})`));
      
      if (validation.errors.length > 0) {
        validation.errors.forEach(error => {
          console.log(chalk.red(`  ✗ Error: ${error}`));
          totalErrors++;
        });
      }
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ Warning: ${warning}`));
          totalWarnings++;
        });
      }
    }
  }
  
  console.log(chalk.blue(`\n📊 Validation Summary:`));
  console.log(chalk.green(`  ✓ Valid agents: ${validAgents}`));
  console.log(chalk.yellow(`  ⚠ Total warnings: ${totalWarnings}`));
  console.log(chalk.red(`  ✗ Total errors: ${totalErrors}`));
  console.log(chalk.blue(`  📝 Total agents: ${agents.length}`));
  
  if (totalErrors > 0) {
    console.log(chalk.red('\n❌ Validation failed - please fix errors before publishing'));
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(chalk.yellow('\n⚠️ Validation passed with warnings'));
  } else {
    console.log(chalk.green('\n✅ All agents validated successfully!'));
  }
}

if (require.main === module) {
  validateAllAgents();
}

module.exports = {
  validateAgentFile,
  validateAllAgents
};