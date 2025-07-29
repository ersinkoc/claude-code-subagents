const fs = require('fs-extra');
const path = require('path');
const { validateAgentFile, validateAllAgents } = require('../src/validate');

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
const mockProcessExit = jest.fn();

console.log = mockConsoleLog;
console.error = mockConsoleError;
process.exit = mockProcessExit;

describe('Agent Validation', () => {
  const testDir = path.join(__dirname, '..', 'test-validate-temp');

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDirSync(testDir);
  });

  afterEach(async () => {
    if (fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('validateAgentFile', () => {
    test('should validate a correct agent file', () => {
      const validAgent = `---
name: test-agent
description: This is a test agent with a sufficiently long description that meets the minimum requirements for validation.
---

You are a test agent specialized in testing functionality. Your role is to validate that agent files are properly formatted.

When testing agents, you will:

**Testing Approach:**
- Verify file structure and front matter
- Check content quality and length
- Ensure proper formatting

**Validation Steps:**
1. Parse front matter
2. Check required fields
3. Validate content structure

Always provide thorough testing feedback.`;

      const testFile = path.join(testDir, 'valid-agent.md');
      fs.writeFileSync(testFile, validAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should detect missing front matter', () => {
      const invalidAgent = `This is an agent without front matter.

You are a test agent.`;

      const testFile = path.join(testDir, 'no-frontmatter.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Missing front matter (--- at start of file)');
    });

    test('should detect incomplete front matter', () => {
      const invalidAgent = `---
name: test-agent
description: Test description
// Missing closing ---

You are a test agent.`;

      const testFile = path.join(testDir, 'incomplete-frontmatter.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Front matter not properly closed (missing second ---)');
    });

    test('should detect missing name field', () => {
      const invalidAgent = `---
description: Test description without name
---

You are a test agent.`;

      const testFile = path.join(testDir, 'no-name.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Missing name field in front matter');
    });

    test('should detect missing description field', () => {
      const invalidAgent = `---
name: test-agent
---

You are a test agent.`;

      const testFile = path.join(testDir, 'no-description.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Missing description field in front matter');
    });

    test('should detect empty name field', () => {
      const invalidAgent = `---
name:
description: Test description
---

You are a test agent.`;

      const testFile = path.join(testDir, 'empty-name.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Name field is empty');
    });

    test('should detect empty description field', () => {
      const invalidAgent = `---
name: test-agent
description:
---

You are a test agent.`;

      const testFile = path.join(testDir, 'empty-description.md');
      fs.writeFileSync(testFile, invalidAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Description field is empty');
    });

    test('should warn about short description', () => {
      const agentWithShortDesc = `---
name: test-agent
description: Short desc
---

You are a test agent with detailed instructions here.`;

      const testFile = path.join(testDir, 'short-description.md');
      fs.writeFileSync(testFile, agentWithShortDesc);

      const result = validateAgentFile(testFile);
      expect(result.warnings).toContain('Description is very short (< 50 characters)');
    });

    test('should warn about short content', () => {
      const shortAgent = `---
name: test-agent
description: This is a test agent with proper description length
---

Short content.`;

      const testFile = path.join(testDir, 'short-content.md');
      fs.writeFileSync(testFile, shortAgent);

      const result = validateAgentFile(testFile);
      expect(result.warnings).toContain('Agent content is quite short (< 500 characters)');
    });

    test('should detect system prompt indicators', () => {
      const validSystemPrompt = `---
name: test-agent
description: This is a test agent with proper description length for testing and validation purposes
---

You are a test agent specialized in validation. Your role is to ensure proper formatting and content structure.`;

      const testFile = path.join(testDir, 'valid-system-prompt.md');
      fs.writeFileSync(testFile, validSystemPrompt);

      const result = validateAgentFile(testFile);
      expect(result.warnings).not.toContain('Agent may be missing clear system prompt instructions');
    });

    test('should handle file read errors', () => {
      const nonExistentFile = path.join(testDir, 'does-not-exist.md');
      
      const result = validateAgentFile(nonExistentFile);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to read file');
    });
  });

  describe('validateAllAgents', () => {
    test('should validate all agents without crashing', () => {
      // This test runs the actual validation on all real agents
      expect(() => validateAllAgents()).not.toThrow();
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    test('should complete validation process', () => {
      validateAllAgents();
      expect(mockConsoleLog).toHaveBeenCalled();
      // Just verify the function completes - process.exit is mocked
    });

    test('should display validation summary', () => {
      validateAllAgents();
      
      const logCalls = mockConsoleLog.mock.calls.flat();
      const hasSummary = logCalls.some(call => 
        call && call.toString().includes('Validation Summary')
      );
      expect(hasSummary).toBe(true);
    });

    test('should count agents correctly', () => {
      validateAllAgents();
      
      const logCalls = mockConsoleLog.mock.calls.flat();
      const hasAgentCount = logCalls.some(call => 
        call && call.toString().includes('Total agents:')
      );
      expect(hasAgentCount).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed front matter', () => {
      const malformedAgent = `---
name test-agent without colon
description: Test description
---

You are a test agent.`;

      const testFile = path.join(testDir, 'malformed.md');
      fs.writeFileSync(testFile, malformedAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toContain('Missing name field in front matter');
    });

    test('should handle multiple front matter blocks', () => {
      const multipleBlocks = `---
name: test-agent
description: Test description
---

You are a test agent.

---
This is not valid front matter
---`;

      const testFile = path.join(testDir, 'multiple-blocks.md');
      fs.writeFileSync(testFile, multipleBlocks);

      const result = validateAgentFile(testFile);
      // Should still validate correctly as it only looks at first block
      expect(result.errors).toHaveLength(0);
    });

    test('should handle unicode characters', () => {
      const unicodeAgent = `---
name: test-agent-unicode
description: Test agent with unicode characters: 🤖 ✨ 📝
---

You are a test agent with émojis and spëcial characters.`;

      const testFile = path.join(testDir, 'unicode.md');
      fs.writeFileSync(testFile, unicodeAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);
      const longAgent = `---
name: test-agent-long
description: Test agent with very long content for validation testing purposes
---

You are a test agent. ${longContent}`;

      const testFile = path.join(testDir, 'long-content.md');
      fs.writeFileSync(testFile, longAgent);

      const result = validateAgentFile(testFile);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).not.toContain('Agent content is quite short (< 500 characters)');
    });
  });
});