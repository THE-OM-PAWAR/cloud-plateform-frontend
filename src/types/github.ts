export interface Repository {
  name: string;
  fullName: string;
  private: boolean;
  cloneUrl: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  owner: string;
}

export interface Branch {
  name: string;
  protected: boolean;
}

export interface GitHubStatus {
  connected: boolean;
  username: string | null;
}

export interface DeployRequest {
  repoOwner: string;
  repoName: string;
  branch: string;
}
