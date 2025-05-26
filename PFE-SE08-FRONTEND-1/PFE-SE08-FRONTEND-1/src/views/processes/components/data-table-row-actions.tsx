import { Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Play,
  ShieldCheck,
  ShieldMinus,
  ScanEye,
  Copy,
  Download,
  Share2,
  Star,
  Archive,
  Settings
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { processSchema } from "../data/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ConfirmationDialog } from "@/components/confirmation-dialog-v2";
import { useMutation } from "@tanstack/react-query";
import {
  getProcessById,
  startProcessService,
} from "@/services/processes-services";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

// ProcessViewer component to display BPMN in read-only mode
const ProcessViewer = ({
  bpmnXml,
  processId,
}: {
  bpmnXml?: string;
  processId?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: window,
      },
    });
    const fetchProcess = async () => {
      if (processId) {
        const response = await getProcessById(processId);
        if (response.bpmnXml) {
          modelerRef.current
            ?.importXML(response.bpmnXml)
            .catch((err: Error) => {
              console.error("Failed to import BPMN diagram:", err);
            });
        }
      }
    };
    if (processId) {
      fetchProcess();
    }

    if (bpmnXml) {
      modelerRef.current.importXML(bpmnXml).catch((err: Error) => {
        console.error("Failed to import BPMN diagram:", err);
      });
    }

    // Make it read-only
    if (modelerRef.current) {
      // Type assertion for canvas
      const canvas = modelerRef.current.get("canvas") as {
        viewbox: (viewbox: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => void;
      };
      canvas.viewbox({ x: 0, y: 0, width: 500, height: 500 });

      // Type assertion for eventBus
      const eventBus = modelerRef.current.get("eventBus") as {
        on: (event: string, callback: (event: any) => boolean) => void;
      };
      eventBus.on("element.click", function (event: any) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    }

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, [bpmnXml, processId]);

  return (
    <div className="bg-white w-full h-full">
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
    </div>
  );
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const process = processSchema.parse(row.original);
  const [open, setOpen] = useState<boolean>(false);

  const startProcessMutation = useMutation({
    mutationFn: () => startProcessService(process.key),
    onSuccess: (message: string) => {
      toast.success(message);
    },
    onError: (message: string) => {
      toast.error(message);
    },
  });

  const handleStartProcess = () => {
    startProcessMutation.mutate();
  };

  const stillInDev = () => {
    toast.error("Still in development");
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${type} copied to clipboard`, {
          description: text,
          duration: 2000,
        });
      },
      (err) => {
        toast.error(`Could not copy ${type.toLowerCase()}`, {
          description: "Please try again",
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
        <DropdownMenuLabel className="text-gray-700 font-medium">Process Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!process.suspended && (
          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
            <ConfirmationDialog
              children={
                <div className="flex items-center gap-2 hover:bg-green-50 focus:bg-green-50 w-full">
                  <Play className="h-4 w-4 text-green-600" />
                  <span>Start Process</span>
                </div>
              }
              title="Start Process"
              description={`This action will start the process ${process.name}`}
              onConfirm={handleStartProcess}
              confirmText="Start Process"
              cancelText="Cancel"
            />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => setOpen(true)} className="hover:bg-blue-50 focus:bg-blue-50">
          <ScanEye className="mr-2 h-4 w-4 text-blue-600" />
          <span>View Process</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => copyToClipboard(process.id, 'Process ID')}
          className="hover:bg-gray-50 focus:bg-gray-50"
        >
          <Copy className="mr-2 h-4 w-4 text-gray-600" />
          <span>Copy Process ID</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => copyToClipboard(process.key, 'Process Key')}
          className="hover:bg-gray-50 focus:bg-gray-50"
        >
          <Copy className="mr-2 h-4 w-4 text-gray-600" />
          <span>Copy Process Key</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={stillInDev} className="hover:bg-green-50 focus:bg-green-50">
          <Download className="mr-2 h-4 w-4 text-green-600" />
          <span>Export BPMN</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={stillInDev} className="hover:bg-blue-50 focus:bg-blue-50">
          <Share2 className="mr-2 h-4 w-4 text-blue-600" />
          <span>Share Process</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={stillInDev} className="hover:bg-yellow-50 focus:bg-yellow-50">
          <Star className="mr-2 h-4 w-4 text-yellow-600" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={stillInDev} className="hover:bg-gray-50 focus:bg-gray-50">
          <Archive className="mr-2 h-4 w-4 text-gray-600" />
          <span>Archive Process</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={stillInDev} className="hover:bg-gray-50 focus:bg-gray-50">
          <Settings className="mr-2 h-4 w-4 text-gray-600" />
          <span>Process Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={stillInDev}>
          {process.suspended ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 hover:bg-green-50 focus:bg-green-50 w-full">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>Activate Process</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Activate the process to be able to run it</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-2 hover:bg-red-50 focus:bg-red-50 text-red-600">
              <ShieldMinus className="h-4 w-4" />
              <span>Suspend Process</span>
            </div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[90%] h-[100vh]">
          <DialogHeader className="h-min">
            <DialogTitle>Process: {process.resourceName}</DialogTitle>
          </DialogHeader>
          <div className="min-w-[90%] h-[90vh]">
            <ProcessViewer processId={process.id} />
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
