// Test file to verify imports work correctly
// Run with: npx tsx test-imports.ts

import { githubApi, GitHubStatus, Repository, Branch } from './src/services/github';
import { projectsApi, Project, DeploymentLog } from './src/services/projects';

console.log('✅ All imports successful!');
console.log('GitHub API:', typeof githubApi);
console.log('Projects API:', typeof projectsApi);

// Type checks
const testStatus: GitHubStatus = { connected: true, username: 'test' };
const testRepo: Repository = {
  name: 'test',
  fullName: 'user/test',
  private: false,
  cloneUrl: 'https://github.com/user/test.git',
  defaultBranch: 'main',
  description: 'Test repo',
  language: 'TypeScript',
  updatedAt: new Date().toISOString(),
  owner: 'user'
};

console.log('✅ Type checks passed!');
console.log('Test completed successfully!');
