import axios from 'axios';

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';

const pythonAxios = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 120000,
});

// Interceptor to attach custom keys and ensure clean URLs
pythonAxios.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('http')) {
    const cleanPath = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `${PYTHON_API_URL}${cleanPath}`;
  }

  if (typeof window !== 'undefined') {
    const customPineconeKey = localStorage.getItem('custom_pinecone_key');
    const customGeminiKey = localStorage.getItem('custom_gemini_key');

    if (customPineconeKey) {
      config.headers['X-Pinecone-API-Key'] = customPineconeKey;
    }
    if (customGeminiKey) {
      config.headers['X-Gemini-API-Key'] = customGeminiKey;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default pythonAxios;
