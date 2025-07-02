import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : '';
// Axios instance oluştur
const apiInstance = axios.create({
  baseURL: BASE_URL,
  //timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.url !== '/auth/login') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    return response.data; // Sadece yanıtın data kısmını döndür
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token yenileme mantığını burada ele alabilirsiniz
      console.error('Unauthorized - Access token expired or invalid');
      // Örn: Kullanıcıyı login sayfasına yönlendirin
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const streamPost = async (url, data) => {
  const token = Cookies.get('access_token');

  const response = await fetch(BASE_URL + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Stream isteği başarısız');
  }

  return response;
};
const ApiService = {
  get: (url, params = {}) => apiInstance.get(url, { params }),
  post: (url, data) => apiInstance.post(url, data),
  put: (url, data) => apiInstance.put(url, data),
  delete: (url, data) => apiInstance.delete(url, data),
  upload: (url, formData) =>
    apiInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Content-Encoding': 'gzip'
      }
    }),
  streamPost
  };

export default ApiService;
