import { apiClient } from './api-client.js';

class PostsService {
  async getPostData(postId) {
    return apiClient.get(`/posts/${postId}`);
  }

  async likePost(userId, postId) {
    if (!userId) throw new Error("User not authenticated");
    return apiClient.post(`/posts/${postId}/likes`, { userId: userId });
  }

  async unlikePost(userId, postId) {
    if (!userId) throw new Error("User not authenticated");
    return apiClient.delete(`/posts/${postId}/likes`, { userId: userId });
  }

  async createPost(userId, newPost) {
    return apiClient.post(`/users/${userId}/posts`, { content: newPost });
  }

  async deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  }

  async getUserPosts(userId) {
    return apiClient.get(`/users/${userId}/posts`);
  }

  async getAllPosts() {
    return apiClient.get('/posts');
  }
}

export const postsService = new PostsService();