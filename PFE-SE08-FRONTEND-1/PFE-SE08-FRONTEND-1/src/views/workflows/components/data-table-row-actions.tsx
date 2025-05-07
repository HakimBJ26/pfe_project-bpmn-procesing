import { Row } from "@tanstack/react-table";
import {
  Cog,
  Delete,
  MoreHorizontal,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { workflowSchema } from "../data/schema";

import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { autoFixWorkflowService, deleteWorkflowService } from "@/services/workflows-services";
import { useWorkflowStore } from "@/stores/workflows.store";
import { createFile } from "@/lib/utils";
import { addProcessService } from "@/services/processes-services";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ErrorResponse } from "@/services/types";
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { deleteWorkflow, getWorkflowById } = useWorkflowStore();
  const workflow = workflowSchema.parse(row.original);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [deployError, setDeployError] = useState('');

  const navigate = useNavigate();

  const autoFixWorkflowMutation = useMutation({
    mutationFn: () => autoFixWorkflowService(workflow.id),
    onSuccess: (message: string) => {
      toast.success(message);
    },
    onError: (message: string) => {
      toast.error(message);
    },
  });
  const deleteWorkflowMutation = useMutation({
    mutationFn: () => deleteWorkflowService(workflow.id),
    onSuccess: (message: string) => {
      toast.success(message);
      deleteWorkflow(workflow.id);
    },
    onError: (message: string) => {
      toast.error(message);
    },
  });

  const addProcessMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await addProcessService(file);
      return String(result);
    },
    onSuccess: (message: string) => {
      toast.success(message);
    },
    onError: (error: ErrorResponse) => {
      if(error.response.status === 400){
        setShowDeployDialog(true);
        setDeployError(error.response.data.message || 'This Workflow is not valid to deploy , please check the workflow configuration');
      }else{
        showToastConfigError()
      }
    },
  });

  const showToastConfigError = () => {
    toast.error("This workflow is not ready to deploy , missing some required fields to configure",{
      action: {
        label: "Configure",
        onClick: () => {
          navigate(`/workflow/${workflow.id}/config`);
        },
      },
    })
  }

  const handleDeleteWorkflow = () => {
    deleteWorkflowMutation.mutate();
    setShowDeleteDialog(false);
  };

  const deployProcess = () => {
    const workflowData = getWorkflowById(workflow.id);
    if(workflow.readyToDeploy){
      if (workflowData) {
        const file = createFile(`${workflow.title}`, workflowData?.workflowContent, ".bpmn", "application/xml");
        addProcessMutation.mutate(file);
      } else {
        toast.error("An error occured when deploy this workflow")
      }
    }else{
      showToastConfigError()
    }
  }

  const handleAutoFixWorkflow = () => {
    autoFixWorkflowMutation.mutate();
    setShowDeployDialog(false);
  }

  return (
    <>
    <AlertDialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy Workflow Failed</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="text-red-500">{deployError}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAutoFixWorkflow} className="bg-green-600 hover:bg-green-700">
              Auto Fix
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkflow} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={deployProcess}>
            {" "}
            <Play className="mr-2 h-4 w-4" /> Deploy process
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator />
          <Link to={`/workflow/${workflow.id}/config`}>
            <DropdownMenuItem>
              {" "}
              <Cog className="mr-2 h-4 w-4" /> Configure
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            {" "}
            <Delete className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
