import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getProcessList } from "@/services/processes-services";
import { processData } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProcessPage() {
  const {
    data: processesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: getProcessList,
  });

  const processes: processData[] = processesData?.map((process: processData) => ({
    ...process,
    status: process.suspended ? "suspended" : "active",
    "title": process.resourceName.replace('.bpmn', '')
  })) || [];


  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;


  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Process Instances</h2>
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Here&apos;s a list of your running process instances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
              {processes.length} Active Processes
            </div>
            <Link to="/process-builder">
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md transition-all duration-300 hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Create Process
              </Button>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <DataTable data={processes} columns={columns} />
        </div>
      </div>
      <Toaster />
    </>
  );
}