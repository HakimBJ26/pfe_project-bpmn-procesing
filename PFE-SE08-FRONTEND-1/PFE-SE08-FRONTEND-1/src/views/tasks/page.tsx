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
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Task Management</h2>
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Here&apos;s a list of your current tasks and assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
              {tasks.length} Tasks Available
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <DataTable data={tasks} columns={columns} />
        </div>
      </div>
      <Toaster />
    </>
  );
}