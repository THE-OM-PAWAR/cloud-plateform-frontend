import axios from 'axios';
import type { Repository, Branch, GitHubStatus, DeployRequest } from '@/types/github';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Re-export types for convenience
export type { Repository, Branch, GitHubStatus, DeployRequest };

export const githubApi = {
  async getAuthUrl(token: string): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/github/auth`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.authUrl;
  },

  async getStatus(token: string): Promise<GitHubStatus> {
    const response = await axios.get(`${API_BASE_URL}/github/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getRepositories(token: string): Promise<Repository[]> {
    const response = await axios.get(`${API_BASE_URL}/github/repos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.repositories;
  },

  async getBranches(token: string, owner: string, repo: string): Promise<Branch[]> {
    const response = await axios.get(`${API_BASE_URL}/github/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.branches;
  },

  async disconnect(token: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/github/disconnect`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
