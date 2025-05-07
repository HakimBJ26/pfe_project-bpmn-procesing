import { useEffect, useRef, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import "bpmn-js/dist/assets/diagram-js.css"; // Import diagram-js styles
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // Import BPMN icon font
import { Button } from "@/components/ui/button";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { Save, Trash2, Upload, Info, Download } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ConfirmationDialog from "@/components/confirmation-dialog";

import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";
import {
  addWorkflowService,
  WorkflowPayload,
} from "@/services/workflows-services";
import { AddWorkflowForm } from "./add-workflow-form";
import { ErrorResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useGlobalStore } from "@/stores/global.store";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";

const WorkflowBuilderContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null); // Ref for the modeler instance
  const [open, setOpen] = useState<boolean>(false);
  const { developerMode } = useGlobalStore();
  const processUuid = uuidv4();
  const defaultBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
        <bpmn:process id="Process_${processUuid}" name="Process_${processUuid}" isExecutable="true">
          <bpmn:startEvent id="StartEvent_1" />
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${processUuid}">
            <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
              <dc:Bounds x="173" y="102" width="36" height="36" />
            </bpmndi:BPMNShape>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>`;
  const [bpmnXml, setBpmnXml] = useSessionStorage<string>(
    "bpmn-xml",
    defaultBpmnXml
  );

  const addWorkflowMutation = useMutation({
    mutationFn: async (payload: WorkflowPayload) => {
      const result = await addWorkflowService(payload);
      return String(result);
    },
    onSuccess: (message: string) => {
      toast.success(message, {
        description: "Your workflow has been successfully uploaded",
        icon: <Upload className="h-4 w-4" />,
      });
    },
    onError: (error: { response?: ErrorResponse }) => {
      const message =
        error.response?.data?.message ||
        "An error occurred please try again later";
      toast.error(message);
    },
  });

  const saveBpmn = () => {
    modelerRef.current?.saveXML().then(({ xml }) => {
      if (xml) setBpmnXml(xml);
    });
    toast.success("Workflow saved locally", {
      description: "Your workflow has been saved to browser storage",
      icon: <Save className="h-4 w-4" />,
    });
  };

  const handleCreateWorkflow = (title: string) => {
    saveBpmn();
    addWorkflowMutation.mutate({ title: title, content: bpmnXml });
    setOpen(false);
  };

  const resetDiagram = () => {
    modelerRef.current
      ?.importXML(defaultBpmnXml)
      .then(() => {
        setBpmnXml(defaultBpmnXml);
        toast.info("Diagram reset", {
          description: "Your diagram has been reset to default",
          icon: <Trash2 className="h-4 w-4" />,
        });
      })
      .catch((err: Error) => {
        console.error("Failed to import BPMN diagram:", err);
        toast.error("Failed to reset diagram");
      });
  };

  const downloadDiagram = () => {
    modelerRef.current?.saveXML({ format: true }).then(({ xml }) => {
      if (xml) {
        const blob = new Blob([xml], { type: "application/xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `workflow-${new Date()
          .toISOString()
          .slice(0, 10)}.bpmn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Diagram downloaded", {
          description: "Your workflow has been downloaded as a BPMN file",
          icon: <Download className="h-4 w-4" />,
        });
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();

      // Basic XML validation check
      if (!content.includes("<?xml") || !content.includes("bpmn:")) {
        toast.error("Invalid BPMN file", {
          description: "The selected file is not a valid BPMN file.",
        });
        return;
      }

      // Import the BPMN content
      if (modelerRef.current) {
        modelerRef.current
          .importXML(content)
          .then(() => {
            setBpmnXml(content);
            toast.success("Workflow imported successfully", {
              description: "The workflow has been imported from the file.",
              icon: <Upload className="h-4 w-4" />,
            });
          })
          .catch((err: Error) => {
            console.error("Error importing BPMN:", err);
            toast.error("Failed to import workflow", {
              description:
                "There was an error importing the workflow. Please check the file format.",
            });
          });
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file", {
        description: "There was an error reading the file. Please try again.",
      });
    }

    // Reset the input
    event.target.value = "";
  };

  useEffect(() => {
    if (!containerRef.current) return;
    if (developerMode) {
      modelerRef.current = new BpmnModeler({
        container: containerRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current,
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
        ],
        moddleExtensions: {
          camunda: camundaModdle,
        },
      });
    } else {
      modelerRef.current = new BpmnModeler({
        container: containerRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current,
        },
        moddleExtensions: {
          camunda: camundaModdle,
        },
      });
    }

    modelerRef.current.importXML(bpmnXml).catch((err: Error) => {
      console.error("Failed to import BPMN diagram:", err);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveBpmn();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [developerMode]);

  const isDefaultDiagram = bpmnXml === defaultBpmnXml;

  return (
    <div className="h-[100vh] w-full bg-white flex flex-col">
      <Card className="m-4 shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                Workflow Builder
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                    >
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create and edit BPMN workflows</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Press Ctrl+S to save
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ConfirmationDialog
                        confirmText="Delete"
                        cancelText="Cancel"
                        title="Delete Diagram"
                        description="Are you sure you want to delete the diagram? This action cannot be undone."
                        onConfirm={resetDiagram}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </ConfirmationDialog>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset the diagram to its default state</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                      onClick={saveBpmn}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save the workflow locally (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                      onClick={downloadDiagram}
                      disabled={isDefaultDiagram}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download the workflow as BPMN file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".bpmn,.xml"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Import workflow from file"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import File
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Import workflow from a BPMN file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isDefaultDiagram}
                          onClick={() => setOpen(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Workflow
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload the workflow to the server</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Workflow</DialogTitle>
                    <DialogDescription>
                      Assign Workflow title and Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <AddWorkflowForm onSubmit={handleCreateWorkflow} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div ref={containerRef} className="flex-1 overflow-hidden" />
          <div
            ref={propertiesPanelRef}
            className="border-l rounded-3xl border-gray-200 overflow-y-auto"
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default WorkflowBuilderContainer;
