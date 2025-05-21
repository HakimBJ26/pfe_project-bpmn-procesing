import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import "dmn-js/dist/assets/diagram-js.css";
import DmnJS from "dmn-js/lib/Modeler";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import "dmn-js/dist/assets/dmn-js-decision-table-controls.css";
import "dmn-js/dist/assets/dmn-js-decision-table.css";
import "dmn-js/dist/assets/dmn-js-drd.css";
import "dmn-js/dist/assets/dmn-js-literal-expression.css";
import "dmn-js/dist/assets/dmn-js-shared.css";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Upload, Info, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { useSessionStorage } from "usehooks-ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDmnByIdService,
  uploadDmnService,
  updateDmnService,
} from "@/services/dmn-services";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { ErrorPage } from "@/components/error-page";

const DmnBuilder = () => {
  const { dmnId } = useParams();
  const isEditMode = !!dmnId;
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const dmnRef = useRef<any | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [dmnName, setDmnName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const randomId = Math.random().toString(36).substring(7);

  const defaultDmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="Definitions_${randomId}" name="DRD" namespace="http://camunda.org/schema/1.0/dmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" exporterVersion="5.31.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.22.0">
  <decision id="Decision_${randomId}" name="Decision 1">
    <decisionTable id="DecisionTable_0xnoyyr">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="Decision_${randomId}">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

  const [dmnXml, setDmnXml] = useSessionStorage<string>(
    "dmn-xml",
    defaultDmnXml
  );

  // Fetch DMN data if in edit mode
  const {
    data: dmnData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dmn", dmnId],
    queryFn: () => getDmnByIdService(dmnId as string),
    enabled: isEditMode,
  });

  // Update DMN mutation
  const updateDmnMutation = useMutation({
    mutationFn: async ({
      id,
      xml,
      name,
    }: {
      id: string;
      xml: string;
      name: string;
    }) => {
      return updateDmnService(id, {
        content: xml,
        name: name,
      });
    },
    onSuccess: () => {
      toast.success("DMN updated successfully", {
        description: "Your changes have been saved to the server",
        icon: <Save className="h-4 w-4" />,
      });
      queryClient.invalidateQueries({ queryKey: ["dmns"] });
    },
    onError: (error) => {
      console.error("Error updating DMN:", error);
      toast.error("Failed to update DMN", {
        description: "There was an error updating your DMN. Please try again.",
      });
    },
  });

  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    if (isEditMode && dmnData) {
      // Set DMN name from fetched data
      setDmnName(dmnData.name);

      // Initialize modeler with DMN content
      dmnRef.current = new DmnJS({
        container: containerRef.current,
        width: "100%",
        height: "100%",
        position: "absolute",
        decisionTable: {
          keyboard: {
            bindTo: document,
          },
        },
      });

      // Import the DMN content
      const contentToImport = dmnData.content || defaultDmnXml;
      dmnRef.current.importXML(contentToImport, (err: any) => {
        if (err) {
          console.error("Error importing DMN:", err);
          toast.error("Error loading DMN");
        } else {
          console.log("DMN imported successfully");
          setDmnXml(contentToImport);
        }
      });
    } else {
      // Initialize with default content for new DMN
      dmnRef.current = new DmnJS({
        container: containerRef.current,
        width: "100%",
        height: "100%",
        position: "absolute",
        decisionTable: {
          keyboard: {
            bindTo: document,
          },
        },
      });

      dmnRef.current.importXML(dmnXml, (err: any) => {
        if (err) {
          console.error("Error importing DMN:", err);
        } else {
          console.log("DMN imported successfully");
        }
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveDmn();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup on component unmount
    return () => {
      if (dmnRef.current) {
        dmnRef.current.destroy();
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, dmnData, containerRef]);

  const saveDmn = () => {
    dmnRef.current?.saveXML((err: any, xml: string) => {
      if (err) {
        console.error("Error saving DMN:", err);
        toast.error("Failed to save DMN diagram");
      } else {
        setDmnXml(xml);

        // If in edit mode, also update on server
        if (isEditMode && dmnId) {
          updateDmnMutation.mutate({
            id: dmnId,
            xml: xml,
            name: dmnName,
          });
        } else {
          toast.success("DMN saved locally", {
            description: "Your DMN diagram has been saved to browser storage",
            icon: <Save className="h-4 w-4" />,
          });
        }
      }
    });
  };

  const resetDmn = () => {
    dmnRef.current?.importXML(defaultDmnXml, (err: any) => {
      if (err) {
        console.error("Error resetting DMN:", err);
        toast.error("Failed to reset DMN diagram");
      } else {
        setDmnXml(defaultDmnXml);
        toast.info("DMN reset", {
          description: "Your DMN diagram has been reset to default",
          icon: <Trash2 className="h-4 w-4" />,
        });
      }
    });
  };

  const downloadDmn = () => {
    dmnRef.current?.saveXML({ format: true }, (err: any, xml: string) => {
      if (err) {
        console.error("Error downloading DMN:", err);
        toast.error("Failed to download DMN diagram");
      } else {
        const blob = new Blob([xml], { type: "application/xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `dmn-${dmnName || new Date().toISOString().slice(0, 10)
          }.dmn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("DMN downloaded", {
          description: "Your DMN diagram has been downloaded as a DMN file",
          icon: <Download className="h-4 w-4" />,
        });
      }
    });
  };

  const uploadDmn = async () => {
    if (!dmnName.trim()) {
      toast.error("Please provide a name for the DMN");
      return;
    }

    setIsUploading(true);

    try {
      // Get the current XML from the modeler
      dmnRef.current?.saveXML((err: any, xml: string) => {
        if (err) {
          console.error("Error getting DMN XML:", err);
          toast.error("Failed to get DMN XML");
          setIsUploading(false);
          return;
        }

        // If in edit mode, update the DMN instead of uploading a new one
        const uploadPromise =
          isEditMode && dmnId
            ? updateDmnMutation.mutateAsync({
              id: dmnId,
              xml: xml,
              name: dmnName,
            })
            : uploadDmnService(xml, dmnName);

        uploadPromise
          .then(() => {
            toast.success(
              isEditMode
                ? "DMN updated successfully"
                : "DMN uploaded successfully",
              {
                description: `Your DMN "${dmnName}" has been ${isEditMode ? "updated" : "uploaded"
                  } to the server`,
                icon: <Upload className="h-4 w-4" />,
              }
            );

            // Reset form if not in edit mode
            if (!isEditMode) {
              setDmnName("");
            }
            setUploadDialogOpen(false);
          })
          .catch((error) => {
            console.error(
              `Error ${isEditMode ? "updating" : "uploading"} DMN:`,
              error
            );
            toast.error(`Failed to ${isEditMode ? "update" : "upload"} DMN`, {
              description: `There was an error ${isEditMode ? "updating" : "uploading"
                } your DMN. Please try again.`,
            });
          })
          .finally(() => {
            setIsUploading(false);
          });
      });
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "uploading"} DMN:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "upload"} DMN`, {
        description: `There was an error ${isEditMode ? "updating" : "uploading"
          } your DMN. Please try again.`,
      });
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();

      // Basic XML validation check
      // if (!content.includes('<?xml') || !content.includes('dmn:')) {
      //   toast.error("Invalid DMN file", {
      //     description: "The selected file is not a valid DMN file.",
      //   });
      //   return;
      // }

      // Import the DMN content
      if (dmnRef.current) {
        dmnRef.current.importXML(content, (err: any) => {
          if (err) {
            console.error("Error importing DMN:", err);
            toast.error("Failed to import DMN", {
              description:
                "There was an error importing the DMN. Please check the file format.",
            });
          } else {
            setDmnXml(content);
            toast.success("DMN imported successfully", {
              description: "The DMN has been imported from the file.",
              icon: <Upload className="h-4 w-4" />,
            });
          }
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

  const isDefaultDmn = dmnXml === defaultDmnXml;

  if (isEditMode && isLoading) return <FullScreenLoader />;
  if (isEditMode && isError) return <ErrorPage />;

  return (
    <div className="h-[100vh] w-full bg-gray-50 flex flex-col">
      <Card className="m-4 shadow-md border-0 bg-white rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/10 rounded-xl opacity-50 z-0"></div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {isEditMode
                  ? `Edit DMN: ${dmnName}`
                  : "Decision Model and Notation Builder"}
              </h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Info
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View information about the DMN builder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About DMN Builder</DialogTitle>
                    <DialogDescription>
                      This is a DMN (Decision Model and Notation) builder that
                      allows you to create and edit decision tables.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-500">
                      DMN is a standard for business decision modeling. It provides a graphical notation for specifying business decisions in a way that business users can understand.
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <h4 className="font-medium text-amber-700">Keyboard Shortcuts</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center"><kbd className="px-2 py-1 bg-white rounded border mr-2 text-xs">Ctrl+S</kbd> Save diagram</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ConfirmationDialog
                        confirmText="Delete"
                        cancelText="Cancel"
                        title="Reset DMN Diagram"
                        description="Are you sure you want to reset this DMN diagram? This action cannot be undone."
                        onConfirm={resetDmn}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
                          disabled={isEditMode} // Disable reset in edit mode
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </ConfirmationDialog>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-red-100 shadow-md">
                    <p>Reset the DMN diagram to its default state</p>
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
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-sm"
                      onClick={saveDmn}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-green-100 shadow-md">
                    <p>
                      Save the DMN diagram{" "}
                      {isEditMode ? "to the server" : "locally"} (Ctrl+S)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-sm"
                      onClick={downloadDmn}
                      disabled={isDefaultDmn}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-purple-100 shadow-md">
                    <p>Download the DMN diagram as a DMN file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isEditMode && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-sm"
                        onClick={() => setUploadDialogOpen(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-blue-100 shadow-md">
                      <p>Upload the current DMN to the server</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {isEditMode && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-sm"
                        onClick={saveDmn}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-blue-100 shadow-md">
                      <p>Update the DMN on the server</p>
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
                        accept=".dmn,.xml"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Import DMN from file"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import File
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-amber-100 shadow-md">
                    <p>Import DMN from a file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Info
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View information about the DMN builder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About DMN Builder</DialogTitle>
                    <DialogDescription>
                      This is a DMN (Decision Model and Notation) builder that
                      allows you to create and edit decision tables.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-500">
                      DMN is a standard notation for the precise specification
                      of business decisions with business rules.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This builder supports decision tables, literal
                      expressions, and decision requirements diagrams.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Upload DMN Dialog */}
              <Dialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Update DMN" : "Upload DMN"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditMode
                        ? "Update the current DMN on the server."
                        : "Upload the current DMN to the server. The DMN will be available in your DMNs list."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dmn-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="dmn-name"
                        value={dmnName}
                        onChange={(e) => setDmnName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter DMN name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={uploadDmn}
                      disabled={!dmnName.trim() || isUploading}
                    >
                      {isUploading
                        ? "Processing..."
                        : isEditMode
                          ? "Update"
                          : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0"></div>
      </div>
      <Toaster />
    </div>
  );
};

export default DmnBuilder;
