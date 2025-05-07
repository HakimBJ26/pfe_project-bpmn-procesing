import { axiosInstance } from "@/lib/axios";
import { processData, taskData } from "./types";


export const addProcessService = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await axiosInstance.post("/deploy-process", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getProcessList = async (): Promise<processData[]> => {
  const response = await axiosInstance.get("/list-processes");
  return response.data;
};

export const getProcessById = async (processId: string): Promise<processData> => {
  const response = await axiosInstance.get(`/processes/${processId}`);
  return response.data;
};

export const getTasksList = async (): Promise<taskData[]> => {
  const response = await axiosInstance.get("/tasks");
  return response.data;
};

export const getTaskForm = async (taskId: string): Promise<any> => {
  const response = await axiosInstance.get(`/task/${taskId}/form`);
  return response.data;
};

export const claimTaskService = async (
  taskId: string,
  userId: string
): Promise<string> => {
  const response = await axiosInstance.post(
    `/tasks/${taskId}/user/claim?userId=${userId}`
  );
  return response.data;
};

export const startProcessService = async (
  processId: string
): Promise<string> => {
  const response = await axiosInstance.get(
    `/start-process?processKey=${processId}`
  );
  return response.data;
};
