const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  constructor() {}

  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  async shortenUrl(originalUrl) {
    try {
      const response = await fetch(`${API_BASE_URL}/urls/shorten`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ originalUrl }),
      });

      return await this.handleResponse(response);
    } catch (err) {
      throw new Error(err.message || 'Failed to shorten URL');
    }
  }

  async getUserUrls() {
    try {
      const response = await fetch(`${API_BASE_URL}/urls/user/all`, {
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch URLs');
    }
  }

  async deleteUrl(shortId) {
    try {
      const response = await fetch(`${API_BASE_URL}/urls/${shortId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (err) {
      throw new Error(err.message || 'Failed to delete URL');
    }
  }
}

const api = new APIClient();
