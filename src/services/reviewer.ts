import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Review {
  id: string;
  repoName: string;
  repoOwner: string;
  techStack: string;
  language: string;
  topics: string[];
  issues: string[];
  status: 'pending' | 'scanning' | 'analyzing' | 'generating' | 'fixing' | 'completed' | 'failed';
  summary?: string;
  recommendations?: string;
  filesGenerated?: Array<{
    name: string;
    content: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export interface ReviewProgress {
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

export const reviewerApi = {
  async getRepositories(token: string) {
    const response = await axios.get(`${API_BASE_URL}/review/repos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.repositories;
  },

  async startReview(token: string, repoOwner: string, repoName: string, socketId?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/review/start`,
      { repoOwner, repoName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(socketId && { 'X-Socket-ID': socketId })
        }
      }
    );
    return response.data;
  },

  async fixRepository(token: string, reviewId: string, socketId?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/review/fix`,
      { reviewId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(socketId && { 'X-Socket-ID': socketId })
        }
      }
    );
    return response.data;
  },

  async getReviews(token: string): Promise<Review[]> {
    const response = await axios.get(`${API_BASE_URL}/review`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.reviews;
  },

  async getReview(token: string, reviewId: string): Promise<Review> {
    const response = await axios.get(`${API_BASE_URL}/review/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.review;
  }
};
