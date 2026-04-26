import { apiClient } from './api-client.js';

class SearchService {
  async search(query, type = "users") {
    return apiClient.get(`/search?query=${encodeURIComponent(query)}&type=${type}`);
  }

  async searchUsers(query) {
    return this.search(query, "users");
  }

  async searchPosts(query) {
    return this.search(query, "posts");
  }
}

export const searchService = new SearchService();