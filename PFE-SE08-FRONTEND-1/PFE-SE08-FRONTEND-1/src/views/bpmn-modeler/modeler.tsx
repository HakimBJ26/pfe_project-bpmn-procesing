import { useEffect, useRef } from "react";
import { useSessionStorage } from "usehooks-ts";
import "bpmn-js/dist/assets/diagram-js.css"; // Import diagram-js styles
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // Import BPMN icon font
import { Button } from "@/components/ui/button";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { Play, Save, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { addProcessService } from "@/services/processes-services";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import ConfirmationDialog from "@/components/confirmation-dialog";

import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import { createFile } from "@/lib/utils";

const BpmnModelerContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null); // Ref for the modeler instance
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

  const addProcessMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await addProcessService(file);
      return String(result);
    },
    onSuccess: (message: string) => {
      toast.success(message);
    },
    onError: (error: Error) => {
      console.error("Create Process failed:", error);
      toast(error.message);
    },
  });

  const saveBpmn = () => {
    modelerRef.current?.saveXML().then(({ xml }) => {
      if (xml) setBpmnXml(xml);
    });
    toast("Diagram saved localy");
  };

  const handleCreateProcess = () => {
    saveBpmn();
    const file = createFile(`Process_${processUuid}`, bpmnXml, ".bpmn", "application/xml");
    addProcessMutation.mutate(file);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      propertiesPanel: {
        parent: propertiesPanelRef.current,
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdle
      }
    });

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
  }, []);

  return (
    <div className="h-[100vh] w-full bg-white">
      <div className="p-5 flex justify-between">
        <div className="flex items-center gap-5">
          <ConfirmationDialog
            confirmText="Delete"
            cancelText="Cancel"
            title="Delete Diagram"
            description="Are you sure you want to delete the diagram?"
            onConfirm={() => {
              modelerRef.current
                ?.importXML(defaultBpmnXml)
                .then(() => {
                  setBpmnXml(defaultBpmnXml);
                })
                .catch((err: Error) => {
                  console.error("Failed to import BPMN diagram:", err);
                });
            }}
          >
            <Button variant="outline">
              <Trash2 />
              Delete Diagram
            </Button>
          </ConfirmationDialog>
        </div>
        <div className="flex justify-around">
          <Button
            variant="destructive"
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={saveBpmn}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button
            variant="destructive"
            className="rounded-md bg-blue-600 ml-5 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleCreateProcess}
          >
            <Play className="h-4 w-4" />
            Add Process
          </Button>
        </div>
      </div>
      <div className="flex flex-row h-[100vh] w-full bg-white">
        <div ref={containerRef} className="h-full w-full overflow-hidden" />
        <div ref={propertiesPanelRef} />
      </div>
      <Toaster />
    </div>
  );
};

export default BpmnModelerContainer;
