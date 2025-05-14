import { camundaAxiosInstance } from "@/lib/axios";
import { taskData } from "./types";

interface Data {
  [key: string]: string;
}

export interface submitTaskServiceArgs {
  taskId: string;
  data: Data;
}

export const submitTaskService = async (
  payload: submitTaskServiceArgs
): Promise<string> => {
  const response = await camundaAxiosInstance.post(
    `/tasks/${payload.taskId}/submit-form`,
    payload.data
  );
  return response.data;
};

export const getTaskService = async (taskId: string): Promise<taskData> => {
  const response = await camundaAxiosInstance.get(`/tasks/${taskId}`);
  return response.data;
};