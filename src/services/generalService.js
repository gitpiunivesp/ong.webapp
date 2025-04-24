import { api } from "../boot/axios";

export const getData = async (category) => {
  try {
    const response = await api.get(`/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    throw error;
  }
};

export const getDataById = async (category, id) => {
  try {
    const response = await api.get(`/${category}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} data by ID:`, error);
    throw error;
  }
};

export const postData = async (category, data) => {
  try {
    const response = await api.post(`/${category}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting ${category} data:`, error);
    throw error;
  }
};

export const updateData = async (category, id, data) => {
  try {
    const response = await api.put(`/${category}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${category} data:`, error);
    throw error;
  }
};

export const deleteData = async (category, id) => {
  try {
    const response = await api.delete(`/${category}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${category} data:`, error);
    throw error;
  }
};
