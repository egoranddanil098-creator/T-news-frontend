import { apiClient } from './api-client.js';

class FollowsService {
  async followUser(userId, followingId) {
    if (!userId) throw new Error("User not authenticated");
    return apiClient.post(`/users/${userId}/follow`, { 
      followingId: followingId 
    });
  }

  async unFollowUser(userId, unfollowingId) {
    if (!userId) throw new Error("User not authenticated");
    return apiClient.delete(`/users/${userId}/follow`, { 
      unfollowingId: unfollowingId 
    });
  }

  async getFollowing(userId) {
    return apiClient.get(`/users/${userId}/following`);
  }
}

export const followsService = new FollowsService();