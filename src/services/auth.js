import { api } from "../boot/axios";

export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);

    if (response.status == "200") return response.data;

    return null;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};
