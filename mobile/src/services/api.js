import axios from 'axios';
import { Platform } from 'react-native';

// For Expo physical devices / Android emulator localhost mapping
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = async () => {
  try {
    const res = await apiClient.get('/health');
    return res.data;
  } catch (err) {
    return { status: 'offline' };
  }
};

export const fetchFields = async () => {
  try {
    const res = await apiClient.get('/fields');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const fetchYieldPrediction = async (fieldId) => {
  try {
    const res = await apiClient.get(`/fields/${fieldId}/yield-prediction?force_mock=true`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export default apiClient;
