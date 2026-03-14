export interface Project {
  _id: string;
  name: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  repositoryUrl: string;
  subdomain: string;
  domain?: string;
  port: number;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'stopped';
  deployedUrl?: string;
  sslEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentLog {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface DeployRequest {
  repoOwner: string;
  repoName: string;
  branch: string;
  subdomain: string;
}
