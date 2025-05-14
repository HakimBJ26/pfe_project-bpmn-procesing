import { useEffect, useRef, useState } from "react";
import { FormEditor } from "@bpmn-io/form-js";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { HardDriveUpload, Save, Trash2, Info, Upload } from "lucide-react";
import { useSessionStorage } from "usehooks-ts";
import * as _ from "lodash";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadFormService, uploadFormServiceArgs, updateFormService, getFormByKeyService } from "@/services/form-services";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddFormForm } from "./add-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { ErrorPage } from "@/components/error-page";

const FormBuilder = () => {
  const { formKey } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<FormEditor | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const defaultformJson = {
    type: "default",
    schemaVersion: 18,
    components: [],
  };
  const [formJson, setFormJson] = useSessionStorage(
    "formSchema",
    defaultformJson
  );

  const { data: formData, isLoading, isError } = useQuery({
    queryKey: ["form", formKey],
    queryFn: () => getFormByKeyService(formKey!),
    enabled: !!formKey,
  });

  // Function to validate and fix form schema components
  const validateAndFixFormSchema = (schema: any) => {
    if (!schema) return defaultformJson;

    // Make a deep copy of the schema to avoid modifying the original
    const fixedSchema = _.cloneDeep(schema);

    // Ensure type is set
    if (!fixedSchema.type) {
      fixedSchema.type = "default";
    }

    // Ensure schemaVersion is set
    if (!fixedSchema.schemaVersion) {
      fixedSchema.schemaVersion = 18;
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

  useEffect(() => {
    if (!containerRef.current) return;

    formRef.current = new FormEditor({
      container: containerRef.current,
    });

    if (formData && formKey) {
      try {
        const cleanFormData = {
          ...formData.content,
          id: formData.id
        };

        // Validate and fix the form schema before importing
        const validatedFormData = validateAndFixFormSchema(cleanFormData);
        setFormJson(validatedFormData);

        formRef.current.importSchema(validatedFormData).catch((err: Error) => {
          console.error("Failed to import form schema:", err);
          toast.error("Failed to import form schema", {
            description: err.message,
          });
        });
      } catch (error) {
        console.error("Error processing form data:", error);
        toast.error("Error processing form data", {
          description: "There was an error processing the form data.",
        });
      }
    } else {
      try {
        // Validate and fix the form schema before importing
        const validatedFormJson = validateAndFixFormSchema(formJson);

        formRef.current.importSchema(validatedFormJson).catch((err: Error) => {
          console.error("Failed to import form schema:", err);
          toast.error("Failed to import form schema", {
            description: err.message,
          });
        });
      } catch (error) {
        console.error("Error processing form data:", error);
        toast.error("Error processing form data", {
          description: "There was an error processing the form data.",
        });
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveForm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (formRef.current) {
        formRef.current.destroy();
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formData, formKey]);

  const uploadFormMutation = useMutation({
    mutationFn: async (formData: uploadFormServiceArgs) => {
      // Create a clean copy of the form data
      const cleanFormData = {
        ...formData,
        id: formData.id || undefined
      };

      if (formKey) {
        return updateFormService(formKey, cleanFormData);
      }
      return uploadFormService(cleanFormData);
    },
    onSuccess: (message: string) => {
      toast.success(message, {
        description: new Date().toLocaleString(),
        onAutoClose: () => {
          resetForm();
          if (formKey) {
            navigate("/forms");
          }
        },
        onDismiss: () => {
          resetForm();
          if (formKey) {
            navigate("/forms");
          }
        },
        duration: 1000,
        action: {
          label: "Close",
          onClick: () => {
            resetForm();
            if (formKey) {
              navigate("/forms");
            }
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const saveForm = () => {
    try {
      let schema = formRef.current?.saveSchema();
      if (schema && !_.isEqual(formJson, schema)) {
        // Validate and fix the schema before saving
        schema = validateAndFixFormSchema(schema);
        setFormJson(schema);
        toast("Form saved locally", {
          description: "Your form has been saved to browser storage",
          icon: <Save className="h-4 w-4" />,
        });
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Error saving form", {
        description: "There was an error saving the form.",
      });
    }
  };

  const resetForm = () => {
    try {
      // Use the validated default form
      const validatedDefaultForm = validateAndFixFormSchema(defaultformJson);
      setFormJson(validatedDefaultForm);
      formRef.current?.importSchema(validatedDefaultForm);
      toast("Form reset", {
        description: "Your form has been reset to default",
        icon: <Trash2 className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error resetting form:", error);
      toast.error("Error resetting form", {
        description: "There was an error resetting the form.",
      });
    }
  };

  const handleUploadForm = (title: string) => {
    saveForm();

    const formDataToUpload = {
      ...formJson,
      title: title
    };

    uploadFormMutation.mutate(formDataToUpload);
    setOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      let formContent;

      try {
        formContent = JSON.parse(content);
      } catch (e) {
        toast.error("Invalid form file", {
          description: "The selected file is not a valid JSON form file.",
        });
        return;
      }

      // Validate basic form structure
      if (!formContent.type || !formContent.components) {
        toast.error("Invalid form structure", {
          description: "The file does not contain a valid form structure.",
        });
        return;
      }

      // Import the form content
      if (formRef.current) {
        formRef.current.importSchema(formContent).then(() => {
          setFormJson(formContent);
          toast.success("Form imported successfully", {
            description: "The form has been imported from the file.",
            icon: <Upload className="h-4 w-4" />,
          });
        }).catch((err: Error) => {
          console.error("Failed to import form:", err);
          toast.error("Failed to import form", {
            description: "There was an error importing the form. Please check the file format.",
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
    event.target.value = '';
  };

  const isFormEmpty = _.isEqual(formJson, defaultformJson);

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <Card className="m-4 shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {formKey ? `Edit Form: ${formData?.title || ''}` : "Form Builder"}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create and edit forms using the form builder</p>
                    <p className="text-xs text-gray-500 mt-1">Press Ctrl+S to save</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-3">
              {!formKey && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ConfirmationDialog
                          confirmText="Delete"
                          cancelText="Cancel"
                          title="Delete Form"
                          description="Are you sure you want to delete this form? This action cannot be undone."
                          onConfirm={resetForm}
                          disabled={isFormEmpty}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            disabled={isFormEmpty}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </ConfirmationDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset the form to its default state</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Import form from file"
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
                    <p>Import form from a JSON file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                      onClick={saveForm}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save the form locally (Ctrl+S)</p>
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
                          onClick={() => setOpen(true)}
                        >
                          <HardDriveUpload className="h-4 w-4 mr-2" />
                          {formKey ? "Update Form" : "Upload Form"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formKey ? "Update the form on the server" : "Upload the form to the server"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{formKey ? "Update Form" : "Add Form"}</DialogTitle>
                    <DialogDescription>
                      {formKey ? "Update form title and click save when you're done." : "Assign form title and click save when you're done."}
                    </DialogDescription>
                  </DialogHeader>
                  <AddFormForm onSubmit={handleUploadForm} initialTitle={formData?.title} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0 bg-white" />
      </div>
      <Toaster />
    </div>
  );
};

export default FormBuilder;
