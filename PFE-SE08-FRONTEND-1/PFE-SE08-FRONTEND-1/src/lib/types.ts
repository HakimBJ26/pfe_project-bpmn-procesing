export interface Data {
  [x: string]: any;
}

export interface Errors {
  [x: string]: string[];
}


export interface SubmitEvent {
    data: Data;
    errors: Errors;
    files: Map<string, File[]>;
  }

export interface ErrorResponse {
  data?: {
    message?: string;
  };
}