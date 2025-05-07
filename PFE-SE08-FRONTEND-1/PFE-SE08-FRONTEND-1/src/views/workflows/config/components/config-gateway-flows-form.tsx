import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";



interface ConfigGatewayFlowsFormProps {
    onSubmit: (payload: any) => void;
    onClose?: () => void;
    title: string;
    gateway: any
}

export function ConfigGatewayFlowsForm({ onSubmit, onClose, title, gateway }: ConfigGatewayFlowsFormProps) {

    // Define the form schema with Zod
    const formSchema = z.object({
        title: z.string().min(5, {
            message: "Title must be at least 5 characters.",
        }),
    });

    // Define the form's value type from the schema
    type FormValues = z.infer<typeof formSchema>;


    // Initialize the form with React Hook Form and Zod validation
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:{
            title:gateway.name
        }
    });

    // Handle form submission
    const handleSubmit = (values: FormValues) => {
        const configs =[{
            "id": gateway.id,
            "attributeValue": values.title,
            "attribute": "NAME",
            "type": "EXCLUSIVE_GATEWAY"
          }]
        for(const incoming of gateway.incoming){
            const formValue = form.getValues(incoming.id)
            if(formValue){
                configs.push({
                    "id": incoming.id,
                    "attributeValue": formValue,
                    "attribute": "FLOW_EXPRESSION",
                    "type": "SEQUENCE_FLOW"
                  })
            }
        }
        for(const outgoing of gateway.outgoing){
            const formValue = form.getValues(outgoing.id)
            if(formValue){
                configs.push({
                    "id": outgoing.id,
                    "attributeValue": formValue,
                    "attribute": "FLOW_EXPRESSION",
                    "type": "SEQUENCE_FLOW"
                  })
            }
        }
        onSubmit({config:configs});
        if (onClose) {
            onClose();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{title}</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter gateway title" {...field} />
                            </FormControl>
                            <FormDescription>
                                Give your gateway a descriptive title.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Separator />
                <h1>Incoming Flows</h1>
                {gateway.incoming.map((incomFlow: any, idx: number) => {
                    return <FormField
                        key={idx}
                        control={form.control}
                        name={incomFlow.id}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Flow {idx + 1}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter valid flow expression"  defaultValue={incomFlow.expression} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Give your gateway a valid flow expression.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                })}
                <Separator />

                <h1>Outgoing Flows</h1>
                {gateway.outgoing.map((outFlow: any, idx: number) => {
                    return <FormField
                        key={idx}
                        control={form.control}
                        name={outFlow.id}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Flow {idx + 1}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter valid flow expression" defaultValue={outFlow.expression} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Give your gateway a valid flow expression.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                })}
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}