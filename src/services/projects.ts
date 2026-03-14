import axios from 'axios';
import type { Project, DeploymentLog, DeployRequest } from '@/types/project';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Re-export types for convenience
export type { Project, DeploymentLog, DeployRequest };

export const projectsApi = {
  async deploy(token: string, data: DeployRequest, socketId?: string): Promise<any> {
    const headers: any = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    if (socketId) {
      headers['x-socket-id'] = socketId;
    }

    const response = await axios.post(`${API_BASE_URL}/projects/deploy`, data, { headers });
    return response.data;
  },

  async getAll(token: string): Promise<Project[]> {
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.projects;
  },

  async getById(token: string, id: string): Promise<Project> {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.project;
  },

  async getLogs(token: string, id: string): Promise<DeploymentLog[]> {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.logs;
  },

  async stop(token: string, id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/projects/${id}/stop`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async restart(token: string, id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/projects/${id}/restart`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async delete(token: string, id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
