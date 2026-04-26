class ApiClient {
  constructor(baseUrl = "https://t-news-backend-parser.up.railway.app/api") {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      }

      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed [${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      method: "POST",
      headers: {
        ...options.headers,
      },
      body: formData,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`Upload failed [${endpoint}]:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
