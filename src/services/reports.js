import { api } from "../boot/axios";

export const getData = async (category) => {
  try {
    const response = await api.get(`/relatorios/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    throw error;
  }
};
