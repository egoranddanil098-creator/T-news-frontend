import { apiClient } from './api-client.js';

class RegisterService {
  async register(username, password) {
    try {
      const data = await apiClient.post('/users', {
        username: username,
        password: password,
      });

      if (data.userId) {
        localStorage.setItem("userId", JSON.stringify(data.userId));
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem("userId");
  }
}

export const registerService = new RegisterService();