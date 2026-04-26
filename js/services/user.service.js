import { apiClient } from './api-client.js';

class UserService {
  async getUserData(id) {
    return apiClient.get(`/users/${id}`);
  }

  async updateUserName(id, username) {
    return apiClient.patch(`/users/${id}`, { username: username });
  }

  async updateUserDescription(id, description) {
    return apiClient.patch(`/users/${id}`, { bio: description });
  }

   async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.upload(`/users/${userId}/avatar`, formData);
  }

  async createPost(userId, newPost) {
    return apiClient.post(`/users/${userId}/posts`, { content: newPost });
  }

  getUserId() {
    const userId = localStorage.getItem("userId");
    return userId ? userId : null;
  }
}

export const userService = new UserService();