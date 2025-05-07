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

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
});

// Define the form's value type from the schema
type FormValues = z.infer<typeof formSchema>;

interface AddWorkflowFormProps {
  onSubmit: (title: string) => void;
}

export function AddWorkflowForm({ onSubmit }: AddWorkflowFormProps) {
  // Initialize the form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit(values.title);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter workflow title" {...field} />
              </FormControl>
              <FormDescription>
                Give your workflow a descriptive title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Workflow</Button>
      </form>
    </Form>
  );
}