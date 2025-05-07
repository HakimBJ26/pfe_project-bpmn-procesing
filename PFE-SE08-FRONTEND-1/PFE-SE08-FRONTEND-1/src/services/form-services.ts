import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { FormData } from "./types";

export interface uploadFormServiceArgs {
  [key: string]: any;
  title:string
}



export const uploadFormService = async (formJson: uploadFormServiceArgs) => {
  try {
    const response = await axiosInstance.post("/forms", {
      content: { ...formJson },
      formKey: formJson.id,
      title:formJson.title
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};


export const getFormsService = async (): Promise<FormData[]>  => {
  try {
    const response = await axiosInstance.get(`/forms`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
}

export const deleteFormService = async (formId: string) => {
  try {
    await axiosInstance.delete(`/forms/${formId}`);
    return "Form deleted successfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const updateFormService = async (formId: string, formJson: uploadFormServiceArgs) => {
  try {
    await axiosInstance.put(`/forms/${formId}`, {
      content: { ...formJson },
      formKey: formJson.id,
      title: formJson.title
    });
    return "Form updated successfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const getFormByKeyService = async (formKey: string): Promise<FormData> => {
  try {
    const response = await axiosInstance.get(`/forms/${formKey}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};