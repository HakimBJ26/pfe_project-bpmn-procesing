import { useEffect, useRef } from "react";
import "bpmn-js/dist/assets/diagram-js.css"; // Import diagram-js styles
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // Import BPMN icon font
import BpmnModeler from "bpmn-js/lib/Modeler";

const BpmnViewer = ({defaultBpmnXml}: {defaultBpmnXml : string}) => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null); // Ref for the modeler instance

  useEffect(() => {
    if (!containerRef.current) return;

    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      propertiesPanel: {
        parent: propertiesPanelRef.current,
      },
    });

    modelerRef.current.importXML(defaultBpmnXml).catch((err: Error) => {
      console.error("Failed to import BPMN diagram:", err);
    });

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, [defaultBpmnXml]);

  return (
    <div className="flex flex-row h-full w-full bg-white">
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
      <div ref={propertiesPanelRef} />
    </div>
  );
};

export default BpmnViewer;
