import { apiClient } from './api-client.js';

class AuthService {
  async login(username, password) {
    try {
      const data = await apiClient.post('/auth', {
        username: username,
        password: password,
      });

      if (data.userId) {
        localStorage.setItem("userId", JSON.stringify(data.userId));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("userId");
    window.location.href = "/html/main.html";
  }

  isAuthenticated() {
    return !!localStorage.getItem("userId");
  }
}

export const authService = new AuthService();
