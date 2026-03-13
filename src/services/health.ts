import axios from 'axios';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
}

export const healthApi = {
  /**
   * Check backend health status
   */
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await axios.get('/api/health');
    return response.data;
  },

  /**
   * Test proxy connection
   */
  testConnection: async (): Promise<boolean> => {
    try {
      await healthApi.checkHealth();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export default healthApi;