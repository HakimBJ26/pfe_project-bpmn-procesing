import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getWorkflowList } from "@/services/workflows-services";
import { useWorkflowStore } from "@/stores/workflows.store";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Workflow } from "./data/schema";
import { workflowData } from "@/services/types";

export default function WorkflowPage() {
  const { setWorkflows } = useWorkflowStore();
  const [displayWorkflows, setDisplayWorkflows] = useState<Workflow[]>([]);
  
  const {
    data: workflowsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflowList,
  });

  useEffect(() => {
    // Update the workflow store
    if (workflowsData) {
      setWorkflows(workflowsData);
      
      // Convert to the expected Workflow type for display
      const convertedWorkflows: Workflow[] = workflowsData.map((workflow: workflowData) => ({
        ...workflow,
        readyToDeploy: true,
      }));
      
      setDisplayWorkflows(convertedWorkflows);
    }
  }, [workflowsData, setWorkflows]);

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Workflows</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your workflows!
            </p>
          </div>
          <Link to="/workflow-builder">
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Create Workflow
            </Button>
          </Link>
        </div>
        <DataTable data={displayWorkflows} columns={columns} />
      </div>
      <Toaster />
    </>
  );
}