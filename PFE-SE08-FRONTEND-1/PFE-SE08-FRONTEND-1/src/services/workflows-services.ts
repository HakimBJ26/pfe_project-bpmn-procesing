import { axiosInstance } from "@/lib/axios";
import { workflowData } from "./types";
import { AxiosError } from "axios";

export interface WorkflowPayload {
  title: string;
  content: string;
}

export interface UpdateWorkflowPayload {
  title?: string;
  content?: string;
  config?: {
    id: string;
    attributeValue: string;
    attribute: "NAME" |
    "FORM_KEY" |
    "DELEGATE_EXPRESSION" |
    "FLOW_EXPRESSION";
    type: "TASK" |
    "USER_TASK" |
    "SERVICE_TASK" |
    "SCRIPT_TASK" |
    "BUSINESS_RULE_TASK" |
    "SEND_TASK" |
    "RECEIVE_TASK" |
    "MANUAL_TASK" |
    "SEQUENCE_FLOW" |
    "EXCLUSIVE_GATEWAY" |
    "PARALLEL_GATEWAY" |
    "INCLUSIVE_GATEWAY"
  }[]
}

// Interface for flow objects
export interface Flow {
  expression: string;
  id: string;
}

// Interface for gateway objects
export interface Gateway {
  incoming: Flow[];
  outgoing: Flow[];
  gatewayDirection: "Diverging" | "Converging";
  name: string | null;
  id: string;
  type: "exclusiveGateway" | "parallelGateway" | "inclusiveGateway";
}

// Interface for task objects
export interface Task {
  id: string;
  name: string | null;
  type: "userTask" | "serviceTask" | "sendTask" | "businessRuleTask" | "scriptTask" | "receiveTask" | "manualTask";
  formKey?: string;
  delegateExpression?: string;
}

// Interface for workflow tasks response
export interface WorkflowTasksResponse {
  tasks: Task[];
  gateways: Gateway[];
}

export const addWorkflowService = async (
  workflowPayload: WorkflowPayload
): Promise<string> => {
  try {
    await axiosInstance.post("/workflows", workflowPayload);
    return "Workflow created succesfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const getWorkflowList = async (): Promise<workflowData[]> => {
  const response = await axiosInstance.get("/workflows");
  return response.data;
};

export const getWorkflowById = async (id: string): Promise<workflowData> => {
  try {
    const response = await axiosInstance.get(`/workflows/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const updateWorkflowService = async (
  updateWorkflowUpdatePayload: UpdateWorkflowPayload,
  workflowId:string
) => {
  try {
    await axiosInstance.put(`/workflows/${workflowId}`, updateWorkflowUpdatePayload);
    return "Workflow updated succesfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const deleteWorkflowService = async (id: string) => {
  try {
    await axiosInstance.delete(`/workflows/${id}`);
    return "Workflow deleted succesfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const getWorkflowTasks = async (id: string): Promise<WorkflowTasksResponse> => {
  try {
    const response = await axiosInstance.get(`/workflows/${id}/tasks`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};
export const autoFixWorkflowService = async (id: string): Promise<string> => {
  try {
    await axiosInstance.put(`/workflows/${id}/auto-fix-gateway-incoming-flow`);
    return "Workflow auto-fixed succesfully";
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};