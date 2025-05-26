import { useEffect, useRef, useState } from "react";
import "bpmn-js/dist/assets/diagram-js.css"; // Import diagram-js styles
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // Import BPMN icon font
import "@camunda/linting/assets/linting.css"; // Import linting styles
import { Button } from "@/components/ui/button";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { UseMutationResult } from "@tanstack/react-query";
import lintingModule from "@camunda/linting/modeler";
import { Linter } from "@camunda/linting";
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
  } from "bpmn-js-properties-panel";
import * as z from "zod";

import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";
import {
    UpdateWorkflowPayload,
} from "@/services/workflows-services";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGlobalStore } from "@/stores/global.store";
import { Card, CardContent } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";


const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
});

// Define the form's value type from the schema
type FormValues = z.infer<typeof formSchema>;

const UpdateWorkflow = ({ defaultBpmnXml, title, updateWorkflowMutation, closeDialog }: { defaultBpmnXml: string, title: string, updateWorkflowMutation: UseMutationResult<string, Error, UpdateWorkflowPayload, unknown>, closeDialog: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
    const propertiesPanelRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<BpmnModeler | null>(null); // Ref for the modeler instance
    const [bpmnXml, setBpmnXml] = useState<string>(defaultBpmnXml);
    const linterRef = useRef<Linter | null>(null);
    const { developerMode } = useGlobalStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: title,
        },
    });

    const saveBpmn = () => {
        modelerRef.current?.saveXML().then(({ xml }) => {
            if (xml) setBpmnXml(xml);
        });
    };

    const handleUpdateWorkflow = (title: string) => {
        modelerRef.current?.saveXML().then(({ xml }) => {
            if (xml) {
                updateWorkflowMutation.mutate({ title: title, content: xml });
            }
            closeDialog();
        });
    };

    // Initialize modeler
    useEffect(() => {
        let modeler: BpmnModeler | null = null;

        const initializeModeler = async () => {
            if (!containerRef.current) return;

            // Initialize linter
            linterRef.current = new Linter({
                modeler: 'web',
                type: 'cloud'
            });

            // Create new modeler instance with properties panel only if developer mode is enabled
            const additionalModules = [lintingModule];
            
            // Only add properties panel modules if developer mode is enabled
            if (developerMode) {
                additionalModules.push(
                    BpmnPropertiesPanelModule,
                    BpmnPropertiesProviderModule,
                    CamundaPlatformPropertiesProviderModule
                );
            }
            
            modeler = new BpmnModeler({
                container: containerRef.current,
                propertiesPanel: developerMode ? {
                    parent: propertiesPanelRef.current,
                } : undefined,
                additionalModules,
                moddleExtensions: {
                    camunda: camundaModdle,
                },
            });

            // Store the modeler reference
            modelerRef.current = modeler;

            // Wait a bit to ensure the container is properly rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            // Import the XML
            await modeler.importXML(bpmnXml);

            // Enable linting after successful import
            if (linterRef.current) {
                const reports = await linterRef.current.lint(bpmnXml);
                const linting = modeler.get('linting') as { setErrors: (reports: any[]) => void; activate: () => void };
                linting.setErrors(reports);
                linting.activate();
            }


        };

        initializeModeler();

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
                modelerRef.current = null;
            }
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleSubmit = (values: FormValues) => {

        handleUpdateWorkflow(values.title);

    };

    return (
        <Card className="flex flex-col h-full w-full bg-white border-none shadow-none">
            <CardContent className="p-0">
                <div className="flex flex-row h-full">
                    {/* Main BPMN modeler container */}
                    <div 
                        ref={containerRef} 
                        className="h-full flex-grow overflow-hidden" 
                        style={{ minHeight: "500px" }} 
                    />
                    
                    {/* Properties panel - only rendered when developer mode is enabled */}
                    {developerMode && (
                        <div
                            ref={propertiesPanelRef}
                            className="border-l border-gray-200 overflow-y-auto w-1/4 max-w-xs"
                        />
                    )}
                </div>
                
                {/* Form controls at the bottom */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <>
                                        <FormItem className="flex flex-col space-y-2 mb-4">
                                            <FormLabel>Workflow Title</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter workflow title" 
                                                    className="w-full" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    </>
                                )}
                            />
                            
                            <DialogFooter className="mt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={closeDialog}
                                    className="mr-2"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={updateWorkflowMutation.isPending}
                                >
                                    {updateWorkflowMutation.isPending ? "Updating..." : "Update Workflow"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
};

export default UpdateWorkflow;