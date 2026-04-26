import { apiClient } from './api-client.js';

class FeedService {
  async getFeed(userId) {
    return apiClient.get(`/feed/${userId}`);
  }
}

export const feedService = new FeedService();