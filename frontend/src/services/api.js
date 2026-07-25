import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const fetchFields = async () => {
  const response = await apiClient.get('/fields');
  return response.data;
};

export const createField = async (fieldData) => {
  const response = await apiClient.post('/fields', fieldData);
  return response.data;
};

export const deleteField = async (fieldId) => {
  const response = await apiClient.delete(`/fields/${fieldId}`);
  return response.data;
};

export const fetchYieldPrediction = async (fieldId) => {
  const response = await apiClient.get(`/fields/${fieldId}/yield-prediction?force_mock=true`);
  return response.data;
};

export const fetchFieldAnalytics = async (fieldId) => {
  const response = await apiClient.get(`/fields/${fieldId}/analytics?force_mock=true`);
  return response.data;
};

export default apiClient;
