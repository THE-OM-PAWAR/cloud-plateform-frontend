import axios from 'axios';

// Use relative URLs since we're using Vite proxy
const API_BASE_URL = '/api';

// Create axios instance with extended timeout for deployments
const apiClient = axios.create({
  timeout: 15 * 60 * 1000, // 15 minutes timeout for long-running deployments
});

export interface DeploymentRequest {
  repoUrl: string;
  siteName?: string;
}

export interface DeploymentResponse {
  status: string;
  projectName?: string;
  url?: string;
  port?: number;
  subdomain?: string;
  sslEnabled?: boolean;
  deploymentId?: string;
  message?: string;
}

export interface DeploymentInfo {
  repoUrl: string;
  port: number;
  subdomain: string;
  sslEnabled: boolean;
  buildDir: string;
  deployedAt: string;
  status: string;
}

export const deploymentApi = {
  /**
   * Deploy a new application
   */
  deploy: async (data: DeploymentRequest): Promise<DeploymentResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/deploy`, data);
    return response.data;
  },

  /**
   * Get all deployments
   */
  getAllDeployments: async (): Promise<Record<string, DeploymentInfo>> => {
    const response = await apiClient.get(`${API_BASE_URL}/deploy`);
    return response.data.deployments;
  },

  /**
   * Get specific deployment info
   */
  getDeployment: async (projectName: string): Promise<DeploymentInfo> => {
    const response = await apiClient.get(`${API_BASE_URL}/deploy/${projectName}`);
    return response.data.deployment;
  },

  /**
   * Delete a deployment
   */
  deleteDeployment: async (projectName: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/deploy/${projectName}`);
  },

  /**
   * Redeploy an application
   */
  redeploy: async (projectName: string): Promise<DeploymentResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/deploy/${projectName}/redeploy`);
    return response.data;
  },

  /**
   * Get deployment status
   */
  getStatus: async (projectName: string): Promise<any> => {
    const response = await apiClient.get(`${API_BASE_URL}/deploy/${projectName}/status`);
    return response.data;
  }
};

export default deploymentApi;