import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getFormsService } from "@/services/form-services";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { ErrorPage } from "@/components/error-page";
import { FormData } from "@/services/types";
import { Check, ChevronsUpDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ConfigTaskFormProps {
    onSubmit: (title: string) => void;
    onClose?: () => void;
    type: 'form' | 'service';
    title: string;
    defaultValue?: string;
}

export function ConfigTaskForm({ onSubmit, onClose, type, title, defaultValue }: ConfigTaskFormProps) {
    const [open, setOpen] = useState(false);

    const {
        data: Forms,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["forms"],
        queryFn: getFormsService,
    });
    
    // Define the form schema with Zod
    const formSchema = z.object({
        [type]: z.string({
            required_error: `Please select a ${type}.`,
        })
    });

    // Define the form's value type from the schema
    type FormValues = z.infer<typeof formSchema>;

    // Initialize the form with React Hook Form and Zod validation
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            [type]: defaultValue || ""
        }
    });

    // Set default value when component mounts or when defaultValue changes
    useEffect(() => {
        if (defaultValue) {
            form.setValue(type, defaultValue);
        }
    }, [defaultValue, form, type]);

    // Handle form submission
    const handleSubmit = (values: FormValues) => {
        onSubmit(values[type]);
        if (onClose) {
            onClose();
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(
            () => {
                toast.success(`${label} copied to clipboard`, {
                    description: text,
                    duration: 2000,
                });
            },
            (err) => {
                toast.error(`Could not copy ${label.toLowerCase()}`, {
                    description: "Please try again",
                });
                console.error('Could not copy text: ', err);
            }
        );
    };

    if (isLoading) return <FullScreenLoader />
    if (isError) return <ErrorPage />

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name={type}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{title}</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? type === "form"
                                                    ? Forms?.find((formItem: FormData) => formItem.formKey === field.value)?.title || field.value
                                                    : field.value === "${notificationTask}" ? "Notification" : field.value
                                                : `Select a ${type}`}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder={`Search ${type}...`} />
                                        <CommandEmpty>No {type} found.</CommandEmpty>
                                        <CommandGroup>
                                            {type === "form" && Forms?.map((formItem: FormData) => (
                                                <CommandItem
                                                    key={formItem.formKey}
                                                    value={formItem.formKey}
                                                    onSelect={() => {
                                                        form.setValue(type, formItem.formKey);
                                                        setOpen(false);
                                                    }}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === formItem.formKey ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span>{formItem.title}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(formItem.formKey, "Form Key");
                                                        }}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </CommandItem>
                                            ))}
                                            {type === "service" && (
                                                <CommandItem
                                                    value="${notificationTask}"
                                                    onSelect={() => {
                                                        form.setValue(type, "${notificationTask}");
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value === "${notificationTask}" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Notification
                                                </CommandItem>
                                            )}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}