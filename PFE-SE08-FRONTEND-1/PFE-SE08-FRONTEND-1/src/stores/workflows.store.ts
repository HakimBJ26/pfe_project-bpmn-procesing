import { workflowData } from "@/services/types";
import { create } from "zustand";

type WorkflowsState = {
    workflows: workflowData[];
    deleteWorkflow: (workflowId: string) => void;
    setWorkflows: (workflows: workflowData[]) => void
    getWorkflowById: (id: string) => workflowData | undefined
};

export const useWorkflowStore = create<WorkflowsState>()(
    (set, get) => ({
        workflows: [],
        setWorkflows: (workflows: workflowData[]) => {
            set({
                workflows: workflows,
            });
        },
        getWorkflowById: (id: string) => {
            return get().workflows.find((workflow) => workflow.id == id)
        },
        deleteWorkflow: (workflowId: string) => {
            set({
                workflows: get().workflows.filter((workflow: workflowData) => workflow.id != workflowId),
            });
        }
    })
);