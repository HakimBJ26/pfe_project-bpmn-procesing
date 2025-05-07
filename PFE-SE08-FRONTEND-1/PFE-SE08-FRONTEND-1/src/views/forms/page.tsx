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
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Forms</h2>
            <div className="flex items-center space-x-2">
              <p className="text-muted-foreground">
                Here&apos;s a list of your forms!
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Click the copy button next to any ID or key to copy it to your clipboard.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Link to="/form-builder">
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Create Form
            </Button>
          </Link>
        </div>
        <DataTable data={forms} columns={columns} />
      </div>
      <Toaster />
    </>
  );
}
