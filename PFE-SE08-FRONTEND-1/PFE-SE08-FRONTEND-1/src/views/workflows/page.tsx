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
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Workflow Management</h2>
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              Here&apos;s a list of your workflows and process definitions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
              {displayWorkflows.length} Workflows
            </div>
            <Link to="/workflow-builder">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Create Workflow
              </Button>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <DataTable data={displayWorkflows} columns={columns} />
        </div>
      </div>
      <Toaster />
    </>
  );
}