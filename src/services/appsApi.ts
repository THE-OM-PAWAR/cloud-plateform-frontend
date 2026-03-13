import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const appsClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5 * 60 * 1000, // 5 minutes timeout for Docker operations on VPS
});

export interface App {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  deploymentType: 'docker' | 'compose';
  dockerImage?: string;
  defaultPort: number;
  env: EnvVar[];
  resources: {
    cpu: string;
    memory: string;
  };
  isActive: boolean;
  deployCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnvVar {
  key: string;
  value: string;
  description: string;
  required: boolean;
}

export interface AppDeployment {
  _id: string;
  app: App | string;
  projectName: string;
  subdomain: string;
  port: number;
  containerName: string;
  status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';
  url?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeployAppRequest {
  projectName: string;
  envVars: Record<string, string>;
}

export interface CreateAppRequest {
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  deploymentType: 'docker' | 'compose';
  dockerImage?: string;
  defaultPort: number;
  env: EnvVar[];
  resources: {
    cpu: string;
    memory: string;
  };
  composeYaml?: string;
}

export const appsApi = {
  // Public marketplace endpoints
  getMarketplaceApps: async (token?: string): Promise<App[]> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await appsClient.get('/apps/marketplace', config);
    return response.data.apps;
  },

  getAppBySlug: async (slug: string, token?: string): Promise<App> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await appsClient.get(`/apps/marketplace/${slug}`, config);
    return response.data.app;
  },

  // User deployment endpoints (require auth)
  deployApp: async (slug: string, data: DeployAppRequest, token: string): Promise<AppDeployment> => {
    const response = await appsClient.post(`/apps/${slug}/deploy`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.deployment;
  },

  getUserDeployments: async (token: string): Promise<AppDeployment[]> => {
    const response = await appsClient.get('/apps/deployments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.deployments;
  },

  getDeploymentDetails: async (projectName: string, token: string): Promise<AppDeployment> => {
    const response = await appsClient.get(`/apps/deployments/${projectName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.deployment;
  },

  stopDeployment: async (projectName: string, token: string): Promise<void> => {
    await appsClient.post(`/apps/deployments/${projectName}/stop`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  startDeployment: async (projectName: string, token: string): Promise<void> => {
    await appsClient.post(`/apps/deployments/${projectName}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  deleteDeployment: async (projectName: string, token: string): Promise<void> => {
    await appsClient.delete(`/apps/deployments/${projectName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getDeploymentLogs: async (projectName: string, token: string, lines?: number): Promise<string> => {
    const response = await appsClient.get(`/apps/deployments/${projectName}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { lines }
    });
    return response.data.logs;
  },

  // Admin endpoints (require auth + admin role)
  createApp: async (data: CreateAppRequest, token: string): Promise<App> => {
    const response = await appsClient.post('/admin/apps', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.app;
  },

  getAllAppsAdmin: async (token: string): Promise<App[]> => {
    const response = await appsClient.get('/admin/apps', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.apps;
  },

  updateApp: async (slug: string, data: Partial<CreateAppRequest>, token: string): Promise<App> => {
    const response = await appsClient.put(`/admin/apps/${slug}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.app;
  },

  deleteApp: async (slug: string, token: string): Promise<void> => {
    await appsClient.delete(`/admin/apps/${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export default appsApi;
