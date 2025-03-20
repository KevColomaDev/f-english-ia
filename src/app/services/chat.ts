import { api } from "./api";

export const chatApi = async (message: string) => {
  try {
    const response = await api.post("/chat", { message });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}