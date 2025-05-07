import { Dmn } from "@/views/dmns/data/schema";
import { axiosInstance } from "@/lib/axios";

export const getDmnsService = async (): Promise<Dmn[]> => {
  const response = await axiosInstance.get("/dmn");
  return response.data;
};

export const getDmnByIdService = async (id: string): Promise<Dmn> => {
  const response = await axiosInstance.get(`/dmn/${id}`);
  return response.data;
};

export const createDmnService = async (dmn: Partial<Dmn>): Promise<Dmn> => {
  const response = await axiosInstance.post("/dmn", dmn);
  return response.data;
};

export const updateDmnService = async (id: string, dmn: Partial<Dmn>): Promise<Dmn> => {
  const response = await axiosInstance.put(`/dmn/${id}`, dmn);
  return response.data;
};

export const deleteDmnService = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/dmn/${id}`);
};

export const uploadDmnService = async (xml: string, name: string): Promise<Dmn> => {
  const formData = new FormData();
  const blob = new Blob([xml], { type: "application/xml" });
  formData.append("file", blob, `${name}.dmn`);

  const response = await axiosInstance.post(`/dmn?name=${encodeURIComponent(name)}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}; 