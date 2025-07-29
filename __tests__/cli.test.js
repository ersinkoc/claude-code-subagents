const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

describe('CLI Integration Tests', () => {
  const testDir = path.join(__dirname, '..', 'test-cli-temp');
  const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
  });

  const runCLI = (args, options = {}) => {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, ...args], {
        ...options,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Set timeout to prevent hanging tests
      setTimeout(() => {
        child.kill();
        reject(new Error('CLI command timed out'));
      }, 10000);
    });
  };

  describe('CLI Help and Version', () => {
    test('should show help when no command provided', async () => {
      const result = await runCLI(['--help']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Claude Code Subagents CLI');
      expect(result.stdout).toContain('install');
      expect(result.stdout).toContain('list');
      expect(result.stdout).toContain('info');
    });

    test('should show version', async () => {
      const result = await runCLI(['--version']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    });
  });

  describe('CLI List Command', () => {
    test('should list all agents', async () => {
      const result = await runCLI(['list']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Available Agents');
      expect(result.stdout).toContain('FRONTEND');
      expect(result.stdout).toContain('BACKEND');
      expect(result.stdout).toContain('SECURITY');
    });

    test('should list agents by category', async () => {
      const result = await runCLI(['list', '--category', 'security']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('SECURITY');
      expect(result.stdout).toContain('security-auditor');
    });

    test('should search agents', async () => {
      const result = await runCLI(['list', '--search', 'code']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Available Agents');
    });
  });

  describe('CLI Info Command', () => {
    test('should show agent info', async () => {
      const result = await runCLI(['info', 'code-reviewer']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Agent Information');
      expect(result.stdout).toContain('code-reviewer');
      expect(result.stdout).toContain('utilities');
    });

    test('should handle non-existent agent', async () => {
      const result = await runCLI(['info', 'nonexistent-agent']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Agent not found');
    });
  });

  describe('CLI Categories Command', () => {
    test('should list categories', async () => {
      const result = await runCLI(['categories']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Available Categories');
      expect(result.stdout).toContain('frontend');
      expect(result.stdout).toContain('backend');
      expect(result.stdout).toContain('security');
    });
  });

  describe('CLI Install Command', () => {
    test('should install specific agents', async () => {
      const result = await runCLI([
        'install', 
        '--list', 'code-reviewer', 'security-auditor',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Installation completed successfully');
      
      const installedFiles = await fs.readdir(testDir);
      expect(installedFiles).toContain('code-reviewer.md');
      expect(installedFiles).toContain('security-auditor.md');
    });

    test('should install by category', async () => {
      const result = await runCLI([
        'install',
        '--category', 'security',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Installation completed successfully');
      
      const installedFiles = await fs.readdir(testDir);
      expect(installedFiles.length).toBeGreaterThan(0);
      expect(installedFiles.some(f => f.includes('security'))).toBe(true);
    });

    test('should handle invalid category', async () => {
      const result = await runCLI([
        'install',
        '--category', 'nonexistent',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Installation failed');
    });

    test('should handle invalid agent names', async () => {
      const result = await runCLI([
        'install',
        '--list', 'nonexistent-agent',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Installation failed');
    });

    test('should install all agents', async () => {
      const result = await runCLI([
        'install',
        '--all',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Installation completed successfully');
      
      const installedFiles = await fs.readdir(testDir);
      expect(installedFiles.length).toBeGreaterThan(60); // We have 67 agents
    });
  });

  describe('CLI Error Handling', () => {
    test('should handle invalid command', async () => {
      const result = await runCLI(['invalid-command']);
      expect(result.code).toBe(1);
    });

    test('should handle missing required arguments', async () => {
      const result = await runCLI(['info']); // Missing agent name
      expect(result.code).toBe(1);
    });
  });

  describe('CLI Output Format', () => {
    test('should have colored output', async () => {
      const result = await runCLI(['list']);
      expect(result.code).toBe(0);
      // We can't easily test for ANSI colors in unit tests,
      // but we can check that the output is structured properly
      expect(result.stdout).toContain('📋');
      expect(result.stdout).toContain('📂');
    });

    test('should have proper success messages', async () => {
      const result = await runCLI([
        'install',
        '--list', 'code-reviewer',
        '--directory', testDir
      ]);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('🚀');
      expect(result.stdout).toContain('✅');
    });
  });
});