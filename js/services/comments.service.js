import { apiClient } from './api-client.js';

class CommentsService {
  async getComments(postId) {
    return apiClient.get(`/posts/${postId}/comments`);
  }

  async createComment(userId, postId, content) {
    return apiClient.post(`/posts/${postId}/comments`, {
      userId: Number(userId),
      content: content,
    });
  }

  async deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}`);
  }
}

export const commentsService = new CommentsService();