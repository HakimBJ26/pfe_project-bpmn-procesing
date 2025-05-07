export interface taskData {
  id: string;
  name: string;
  assignee: string | null;
}

export interface ErrorResponse {
  response: {
    status: number;
    data: {
      message?: string;
    };
  };
}

export interface processData {
  id: string;
  key: string;
  name: string;
  version: number;
  resourceName: string;
  deploymentId: string;
  description: string | null;
  diagramResourceName: string | null;
  bpmnXml: string | null;
  diagramBytes: string | null;
  suspended: boolean;
}

export interface workflowData {
  id: string;
  title: string;
  workflowContent: string;
  creationTimestamp: string;
  updateTimestamp: string;
}


export interface FormData {
  id: string;
  formKey: string;
  title: string;
  content: any;
  creationTimestamp: string;
  updateTimestamp: string;
}