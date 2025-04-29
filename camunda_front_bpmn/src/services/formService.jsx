import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

const getAllForms = async () => {
  try {
    const response = await axios.get(`${API_URL}/forms`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
};

const getFormByKey = async (formKey) => {
  try {
    const response = await axios.get(`${API_URL}/forms/${formKey}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching form with key ${formKey}:`, error);
    throw error;
  }
};

const createForm = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/forms`, formData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
};

const updateForm = async (formKey, formData) => {
  try {
    const response = await axios.put(`${API_URL}/forms/${formKey}`, formData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error updating form with key ${formKey}:`, error);
    throw error;
  }
};

const deleteForm = async (id) => {
  try {
    await axios.delete(`${API_URL}/forms/${id}`, { headers: authHeader() });
    return true;
  } catch (error) {
    console.error(`Error deleting form with id ${id}:`, error);
    throw error;
  }
};

const formService = {
  getAllForms,
  getFormByKey,
  createForm,
  updateForm,
  deleteForm
};

export default formService; 