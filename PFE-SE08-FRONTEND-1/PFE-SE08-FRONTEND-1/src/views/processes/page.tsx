import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getProcessList } from "@/services/processes-services";
import { processData } from "@/services/types";

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
    "title":process.resourceName.replace('.bpmn','')
  })) || [];


  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;


  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Processs</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your current processes!
            </p>
          </div>
        </div>
        <DataTable data={processes} columns={columns} />
      </div>
      <Toaster />
    </>
  );
}