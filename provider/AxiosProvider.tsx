import axios from 'axios';

let API_URL = "https://hrm.dynsimulation.com/api";

if (typeof window !== "undefined") {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  API_URL = isLocal
    ? "http://localhost:5000/api"
    : "https://hrm.dynsimulation.com/api";
}

class AxiosProvider {
  // GET request
  async get(url: string) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
      throw error;
    }
  }

  // POST request
  async post(url: string, data: any) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_URL}${url}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
      throw error;
    }
  }

  // PUT request
  async put(url: string, data: any) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`${API_URL}${url}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
      throw error;
    }
  }

  // DELETE request
  async delete(url: string) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`${API_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
      throw error;
    }
  }

  // File upload (FormData)
  async upload(url: string, formData: FormData) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_URL}${url}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
      throw error;
    }
  }
  // File upload with PUT (for updates)
async updateUpload(url: string, formData: FormData) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}${url}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    throw error;
  }
}

}

export default AxiosProvider;