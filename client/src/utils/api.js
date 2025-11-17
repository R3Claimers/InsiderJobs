class ApiClient {
 
  async get(url, config = {}) {
    return this.request(url, {
      method: 'GET',
      ...config,
    });
  }

  async post(url, body, config = {}) {
    return this.request(url, {
      method: 'POST',
      body,
      ...config,
    });
  }

  async put(url, body, config = {}) {
    return this.request(url, {
      method: 'PUT',
      body,
      ...config,
    });
  }

  
  async patch(url, body, config = {}) {
    return this.request(url, {
      method: 'PATCH',
      body,
      ...config,
    });
  }

  async delete(url, config = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...config,
    });
  }


  async request(url, options = {}) {
    const { headers = {}, body, ...rest } = options;

    // Prepare headers
    const finalHeaders = { ...headers };

    // Prepare body
    let finalBody = body;

    // If body is not FormData and not undefined, convert to JSON
    if (body && !(body instanceof FormData)) {
      finalBody = JSON.stringify(body);
      // Set Content-Type for JSON if not already set
      if (!finalHeaders['Content-Type']) {
        finalHeaders['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(url, {
        ...rest,
        headers: finalHeaders,
        body: finalBody,
      });

      // Parse response
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Check if response is ok (status in range 200-299)
      if (!response.ok) {
        // Create an error object similar to axios
        const error = new Error(responseData.message || `HTTP error! status: ${response.status}`);
        error.response = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
        };
        throw error;
      }

      // Return in axios-like format: { data: ... }
      return { data: responseData };
    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error.response) {
        throw error;
      }

      // For network errors or other fetch errors
      const networkError = new Error(error.message || 'Network error occurred');
      networkError.response = {
        data: { message: error.message },
        status: 0,
        statusText: 'Network Error',
      };
      throw networkError;
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
