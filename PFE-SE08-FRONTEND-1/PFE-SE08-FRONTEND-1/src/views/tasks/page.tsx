import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { getTasksList } from "@/services/processes-services";
import { ErrorPage } from "../../components/error-page";
import { Task } from "./data/schema";
import { taskData } from "@/services/types";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";

export default function TaskPage() {
  const {
    data: tasksData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasksList,
  });

  const tasks: Task[] = tasksData?.map((task: taskData) => ({
    id: task.id,
    title: task.name,
    status: task.assignee ? "claimed" : "unclaimed",
    assign: task.assignee || "-",
  })) || [];

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;


  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your current tasks!
            </p>
          </div>
        </div>
        <DataTable data={tasks} columns={columns} />
      </div>
      <Toaster />
    </>
  );
}