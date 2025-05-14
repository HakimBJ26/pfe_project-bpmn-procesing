import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from "@bpmn-io/form-js";
import "@bpmn-io/form-js/dist/assets/form-js.css";
import { claimTaskService, getTaskForm } from "@/services/processes-services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, User, Info } from "lucide-react";
import { SubmitEvent } from "@/lib/types";
import {
  getTaskService,
  submitTaskService,
  submitTaskServiceArgs,
} from "@/services/task-services";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { ErrorPage } from "@/components/error-page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as _ from "lodash";

type claimTaskMutationArgs = {
  taskId: string;
  userId: string;
};

const Task = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [formState, setFormState] = useState<SubmitEvent>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<Form | null>(null);

  // Function to validate and fix form schema components
  const validateAndFixFormSchema = (schema: any) => {
    if (!schema) return { type: "default", components: [] };

    // Make a deep copy of the schema to avoid modifying the original
    const fixedSchema = _.cloneDeep(schema);

    // Ensure type is set
    if (!fixedSchema.type) {
      fixedSchema.type = "default";
    }

    // Ensure components is an array
    if (!Array.isArray(fixedSchema.components)) {
      fixedSchema.components = [];
    }

    // Fix components with undefined type
    fixedSchema.components = fixedSchema.components.map((component: any) => {
      if (!component) return null;

      const fixedComponent = { ...component };

      // Set a default type for components with undefined type
      if (!fixedComponent.type) {
        console.warn("Found component with undefined type, setting default type 'textfield':", component);
        fixedComponent.type = "textfield";
      }

      return fixedComponent;
    }).filter(Boolean); // Remove any null components

    return fixedSchema;
  };

  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskService(taskId || ""),
    enabled: !!taskId,
  });

  const {
    data: defaultformJson,
    isLoading: isTaskFormLoading,
    isError: isTaskFormError,
  } = useQuery({
    queryKey: ["task-form", taskId],
    queryFn: () => getTaskForm(taskId || ""),
    enabled: !!taskId,
  });

  const claimTaskMutation = useMutation({
    mutationFn: (data: claimTaskMutationArgs) =>
      claimTaskService(data.taskId, data.userId),
    onSuccess: (message: string) => {
      toast.success(message, {
        description: "You are now assigned to this task",
      });
      refetchTask();
    },
    onError: (message: string) => {
      toast.error(message, {
        description: "Failed to claim task",
      });
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: (data: submitTaskServiceArgs) => submitTaskService(data),
    onSuccess: (message: string) => {
      toast.success(message, {
        description: "Task completed successfully",
        onAutoClose: () => navigate("/tasks"),
        onDismiss: () => navigate("/tasks"),
        duration: 2000,
        action: {
          label: "View Tasks",
          onClick: () => navigate("/tasks"),
        },
      });
    },
    onError: (message: string) => {
      toast.error(message, {
        description: "Failed to complete task",
      });
    },
  });

  useEffect(() => {
    if (!containerRef.current || !defaultformJson) return;

    try {
      formRef.current = new Form({
        container: containerRef.current,
      });

      // Validate and fix the form schema before importing
      const validatedFormJson = validateAndFixFormSchema(defaultformJson);

      formRef.current.importSchema(validatedFormJson, {}).catch((err: Error) => {
        console.error("Failed to import form schema:", err);
        toast.error("Failed to import form schema", {
          description: err.message,
        });
      });

      formRef.current.on("changed", (event: SubmitEvent) => {
        setFormState(event);
      });
    } catch (error) {
      console.error("Error processing form data:", error);
      toast.error("Error processing form data", {
        description: "There was an error processing the form data.",
      });
    }

    // Cleanup on component unmount
    return () => {
      if (formRef.current) {
        formRef.current.destroy();
      }
    };
  }, [defaultformJson]);

  const handleClaimTask = () => {
    claimTaskMutation.mutate({ taskId: taskId || "", userId: "demo" });
  };

  const isValidForm = () => {
    if (formState) {
      const { data, errors } = formState;
      if (Object.keys(errors).length) {
        return false;
      }
      const state = formRef.current?._getState();
      if (data && JSON.stringify(data) === JSON.stringify(state?.initialData)) {
        return false;
      }
      return true;
    }
    return false;
  };

  const handleSubmitForm = () => {
    try {
      const isValid = isValidForm();
      const data = formState?.data;
      if (isValid && data) {
        // Ensure the data is valid before submitting
        submitTaskMutation.mutate({
          taskId: taskId || "",
          data: data,
        });
      } else {
        toast.error("Cannot submit form", {
          description: "Please fill out all required fields correctly",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form", {
        description: "There was an error submitting the form.",
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!taskId) {
    return <ErrorPage />;
  }

  if (isTaskLoading || isTaskFormLoading) return <FullScreenLoader />;
  if (isTaskError || isTaskFormError) return <ErrorPage />;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Card className="m-4 shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 mr-2"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 text-gray-500" />
              </Button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {task?.name || "Task Details"}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>Task ID: </span>
                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded ml-1">{taskId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={task?.assignee ? "outline" : "default"}
                      size="sm"
                      className={task?.assignee ? "bg-gray-50 text-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                      onClick={handleClaimTask}
                      disabled={!!task?.assignee}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {task?.assignee ? `Claimed by ${task.assignee}` : "Claim Task"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {task?.assignee
                      ? `This task is already claimed by ${task.assignee}`
                      : "Claim this task to work on it"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSubmitForm}
                      disabled={!isValidForm() || !task?.assignee}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Task
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!task?.assignee
                      ? "You must claim the task before completing it"
                      : !isValidForm()
                        ? "Please fill out all required fields correctly"
                        : "Submit and complete this task"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 p-4">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Task Form</CardTitle>
            <CardDescription>Complete the form below to finish this task</CardDescription>
          </CardHeader>
          <CardContent>
            {task?.assignee ? (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">
                  This task is assigned to <span className="font-medium">{task.assignee}</span>. Fill out the form and click "Complete Task" when you're done.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md flex items-center">
                <Info className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm text-amber-700">
                  You need to claim this task before you can complete it. Click the "Claim Task" button above.
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="form-container bg-white rounded-md border border-gray-100 p-4">
              <div ref={containerRef} className="min-h-[300px]" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Task;
