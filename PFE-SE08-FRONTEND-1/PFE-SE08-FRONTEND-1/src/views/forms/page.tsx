import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getFormsService } from "@/services/form-services";
import { useFormsStore } from "@/stores/forms.store";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export default function FormsPage() {
  const { setForms, forms } = useFormsStore();
  const {
    data: formsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: getFormsService,
  });

  useEffect(() => {
    if (formsData) {
      setForms(formsData);
    }
  }, [formsData, setForms]);

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Form Management</h2>
            <div className="flex items-center space-x-2">
              <p className="text-muted-foreground flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                Here&apos;s a list of your form templates
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-purple-500 cursor-help hover:text-purple-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-white border border-purple-100 shadow-md">
                    <p>Click the copy button next to any ID or key to copy it to your clipboard.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-purple-500"></span>
              {forms.length} Forms
            </div>
            <Link to="/form-builder">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Create Form
              </Button>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <DataTable data={forms} columns={columns} />
        </div>
      </div>
      <Toaster />
    </>
  );
}
