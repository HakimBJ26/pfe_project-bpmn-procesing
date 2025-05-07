import { useEffect, useRef, useState } from "react";
import "bpmn-js/dist/assets/diagram-js.css"; // Import diagram-js styles
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // Import BPMN icon font
import "@camunda/linting/assets/linting.css"; // Import linting styles
import { Button } from "@/components/ui/button";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { UseMutationResult } from "@tanstack/react-query";
import lintingModule from "@camunda/linting/modeler";
import { Linter } from "@camunda/linting";

import * as z from "zod";

import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";
import {
    UpdateWorkflowPayload,
} from "@/services/workflows-services";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


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

            // Create new modeler instance
            modeler = new BpmnModeler({
                container: containerRef.current,
                propertiesPanel: {
                    parent: propertiesPanelRef.current,
                },
                additionalModules: [
                    lintingModule
                ],
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
        <div className="flex flex-col h-full w-full bg-white">
            <div ref={containerRef} className="h-full w-full overflow-hidden" style={{ minHeight: "500px" }} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <>
                                <FormItem className="flex flex-row gap-5 w-full justify-center items-end">
                                    <div className="w-full flex flex-col gap-2">
                                        <FormLabel>Workflow Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter workflow title"  {...field} />
                                        </FormControl>
                                    </div>
                                    <Button type="submit">Update Workflow</Button>

                                </FormItem>
                                <FormMessage />
                            </>
                        )}
                    />

                </form>
            </Form>

        </div>
    );
};

export default UpdateWorkflow;
