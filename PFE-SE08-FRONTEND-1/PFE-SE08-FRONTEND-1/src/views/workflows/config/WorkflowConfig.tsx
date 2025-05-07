import { ErrorPage } from "@/components/error-page";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getWorkflowById,
  getWorkflowTasks,
  UpdateWorkflowPayload,
  updateWorkflowService,
} from "@/services/workflows-services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseISO, format } from "date-fns";
import {
  Cog,
  Edit,
  GitCompareArrows,
  GitPullRequestArrow,
  ScanEye,
  Send,
  Table2,
  User,
  Waypoints,
  Calendar,
  Clock,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DialogContainer from "@/components/dialog-container";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import UpdateWorkflow from "./components/update-workflow";
import { useGlobalStore } from "@/stores/global.store";

export default function WorkflowConfig() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const { developerMode } = useGlobalStore();

  if (workflowId == undefined) return;

  const {
    data: workflowData,
    isLoading: isWorkflowLoading,
    isError: isWorkflowError,
    refetch: refetchWorkflowData,
  } = useQuery({
    queryKey: ["workflow"],
    queryFn: () => getWorkflowById(workflowId),
  });

  const {
    data: workflowTasks,
    isLoading: isWorkflowTasksLoading,
    isError: isWorkflowTasks,
    refetch: reftechWorkflowTasks,
  } = useQuery({
    queryKey: ["workflow-tasks"],
    queryFn: () => getWorkflowTasks(workflowId),
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: (payload: UpdateWorkflowPayload) =>
      updateWorkflowService(payload, workflowId),
    onSuccess: (message: string) => {
      reftechWorkflowTasks();
      refetchWorkflowData();
      toast.success(message, {
        description: "Workflow configuration has been updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Create Process failed:", error);
      toast.error(error.message, {
        description: "Failed to update workflow configuration",
      });
    },
  });

  if (isWorkflowLoading || isWorkflowTasksLoading) return <FullScreenLoader />;
  if (isWorkflowError || isWorkflowTasks) return <ErrorPage />;

  const userTasks = workflowTasks?.tasks
    ? workflowTasks?.tasks.filter((task: any) => task.type == "userTask")
    : [];

  const serviceTasks = workflowTasks?.tasks
    ? workflowTasks?.tasks.filter((task: any) => task.type == "serviceTask")
    : [];

  const sendTasks = workflowTasks?.tasks
    ? workflowTasks?.tasks.filter((task: any) => task.type == "sendTask")
    : [];

  const businessRuleTasks = workflowTasks?.tasks
    ? workflowTasks?.tasks.filter(
        (task: any) => task.type == "businessRuleTask"
      )
    : [];

  const gateways = workflowTasks?.gateways ? workflowTasks?.gateways : [];

  const handleGoBack = () => {
    navigate(-1);
  };

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
                  {workflowData?.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Created:{" "}
                      {format(
                        parseISO(workflowData?.creationTimestamp || ""),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Updated:{" "}
                      {format(
                        parseISO(workflowData?.updateTimestamp || ""),
                        "MMM d, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setOpen(true)}
                      >
                        <ScanEye className="h-4 w-4" />
                        <span>View Diagram</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View the BPMN diagram for this workflow</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent className="min-w-[90%] h-[100vh]">
                <DialogHeader className="h-min">
                  <DialogTitle>BPMN: {workflowData?.title}</DialogTitle>
                </DialogHeader>
                <div className="min-w-[90%] h-[90vh]">
                  <UpdateWorkflow
                    defaultBpmnXml={workflowData?.workflowContent || ""}
                    title={workflowData?.title || ""}
                    updateWorkflowMutation={updateWorkflowMutation}
                    closeDialog={() => setOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 space-y-4 p-4">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">
              Workflow Configuration
            </CardTitle>
            <CardDescription>
              Configure the different elements of your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="space-y-4">
              <TabsList className="grid grid-cols-5 gap-2">
                <TabsTrigger
                  value="user"
                  className="flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>User Tasks</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-blue-100 text-blue-800"
                  >
                    {userTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="service"
                  className="flex items-center justify-center gap-2"
                >
                  <Cog className="h-4 w-4" />
                  <span>Service Tasks</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-green-100 text-green-800"
                  >
                    {serviceTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="send"
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Tasks</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-purple-100 text-purple-800"
                  >
                    {sendTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="business_rule"
                  className="flex items-center justify-center gap-2"
                >
                  <Table2 className="h-4 w-4" />
                  <span>Business Rules</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-amber-100 text-amber-800"
                  >
                    {businessRuleTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="gateways"
                  className="flex items-center justify-center gap-2"
                >
                  <Waypoints className="h-4 w-4" />
                  <span>Gateways</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-gray-100 text-gray-800"
                  >
                    {gateways.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4 pt-4">
                {userTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No user tasks found in this workflow</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userTasks.map((task: any, idx: number) => (
                      <Card
                        key={idx}
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-blue-50 p-4 pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-blue-800">
                              {task.name || `User Task ${idx + 1}`}
                            </CardTitle>
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="space-y-2">
                            {developerMode && (
                              <>
                                <div className="text-sm text-gray-500">
                                  ID:{" "}
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {task.id}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`text-sm ${
                                      task.formKey
                                        ? "text-gray-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {task.formKey ? (
                                      <>
                                        Form ID:{" "}
                                        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                          {task.formKey}
                                        </span>
                                      </>
                                    ) : (
                                      "Form not configured"
                                    )}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                              </>
                            )}
                            <DialogContainer
                              onSubmit={(formKey: string) => {
                                updateWorkflowMutation.mutate({
                                  config: [
                                    {
                                      id: task.id,
                                      attributeValue: formKey,
                                      attribute: "FORM_KEY",
                                      type: "USER_TASK",
                                    },
                                  ],
                                });
                              }}
                              type="form"
                              formTitle="Choose Form"
                              title={`Configure ${task.name || "User Task"}`}
                              defaultValue={task.formKey}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {task.formKey ? "Change Form" : "Assign Form"}
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="service" className="space-y-4 pt-4">
                {serviceTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Cog className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No service tasks found in this workflow</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serviceTasks.map((task: any, idx: number) => (
                      <Card
                        key={idx}
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-green-50 p-4 pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-green-800">
                              {task.name || `Service Task ${idx + 1}`}
                            </CardTitle>
                            <Cog className="h-5 w-5 text-green-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="space-y-2">
                            {developerMode && (
                              <>
                                <div className="text-sm text-gray-500">
                                  ID:{" "}
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {task.id}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`text-sm ${
                                      task.delegateExpression
                                        ? "text-gray-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {task.delegateExpression ? (
                                      <>
                                        Service:{" "}
                                        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                          {task.delegateExpression}
                                        </span>
                                      </>
                                    ) : (
                                      "Service not configured"
                                    )}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                              </>
                            )}
                            <DialogContainer
                              type="service"
                              onSubmit={(service: string) => {
                                updateWorkflowMutation.mutate({
                                  config: [
                                    {
                                      id: task.id,
                                      attributeValue: service,
                                      attribute: "DELEGATE_EXPRESSION",
                                      type: "SERVICE_TASK",
                                    },
                                  ],
                                });
                              }}
                              formTitle="Choose Service"
                              title={`Configure ${task.name || "Service Task"}`}
                              defaultValue={task.delegateExpression}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {task.delegateExpression
                                    ? "Change Service"
                                    : "Assign Service"}
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="send" className="space-y-4 pt-4">
                {sendTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Send className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No send tasks found in this workflow</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sendTasks.map((task: any, idx: number) => (
                      <Card
                        key={idx}
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-purple-50 p-4 pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-purple-800">
                              {task.name || `Send Task ${idx + 1}`}
                            </CardTitle>
                            <Send className="h-5 w-5 text-purple-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="space-y-2">
                            {developerMode && (
                              <>
                                <div className="text-sm text-gray-500">
                                  ID:{" "}
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {task.id}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`text-sm ${
                                      task.delegateExpression
                                        ? "text-gray-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {task.delegateExpression ? (
                                      <>
                                        Service:{" "}
                                        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                          {task.delegateExpression}
                                        </span>
                                      </>
                                    ) : (
                                      "Service not configured"
                                    )}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                              </>
                            )}
                            <DialogContainer
                              type="service"
                              onSubmit={(service: string) => {
                                updateWorkflowMutation.mutate({
                                  config: [
                                    {
                                      id: task.id,
                                      attributeValue: service,
                                      attribute: "DELEGATE_EXPRESSION",
                                      type: "SEND_TASK",
                                    },
                                  ],
                                });
                              }}
                              formTitle="Choose Service"
                              title={`Configure ${task.name || "Send Task"}`}
                              defaultValue={task.delegateExpression}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {task.delegateExpression
                                    ? "Change Service"
                                    : "Assign Service"}
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="business_rule" className="space-y-4 pt-4">
                {businessRuleTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Table2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No business rule tasks found in this workflow</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {businessRuleTasks.map((task: any, idx: number) => (
                      <Card
                        key={idx}
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-amber-50 p-4 pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-amber-800">
                              {task.name || `Business Rule Task ${idx + 1}`}
                            </CardTitle>
                            <Table2 className="h-5 w-5 text-amber-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="space-y-2">
                            {developerMode && (
                              <>
                                <div className="text-sm text-gray-500">
                                  ID:{" "}
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {task.id}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`text-sm ${
                                      task.delegateExpression
                                        ? "text-gray-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {task.delegateExpression ? (
                                      <>
                                        Service:{" "}
                                        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                          {task.delegateExpression}
                                        </span>
                                      </>
                                    ) : (
                                      "Service not configured"
                                    )}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                              </>
                            )}
                            <DialogContainer
                              type="service"
                              onSubmit={(service: string) => {
                                updateWorkflowMutation.mutate({
                                  config: [
                                    {
                                      id: task.id,
                                      attributeValue: service,
                                      attribute: "DELEGATE_EXPRESSION",
                                      type: "BUSINESS_RULE_TASK",
                                    },
                                  ],
                                });
                              }}
                              formTitle="Choose Service"
                              title={`Configure ${
                                task.name || "Business Rule Task"
                              }`}
                              defaultValue={task.delegateExpression}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {task.delegateExpression
                                    ? "Change Service"
                                    : "Assign Service"}
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gateways" className="space-y-4 pt-4">
                {gateways.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Waypoints className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No gateways found in this workflow</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gateways.map((gateway: any, idx: number) => (
                      <Card
                        key={idx}
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-gray-50 p-4 pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-gray-800">
                              {gateway.name || `Gateway ${idx + 1}`}
                            </CardTitle>
                            <Waypoints className="h-5 w-5 text-gray-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="space-y-3">
                            {developerMode && (
                              <div className="text-sm text-gray-500">
                                ID:{" "}
                                <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                  {gateway.id}
                                </span>
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium flex items-center">
                                  <GitCompareArrows className="h-4 w-4 mr-1 text-blue-500" />
                                  Incoming Flows
                                </div>
                                <Badge variant="outline" className="bg-blue-50">
                                  {gateway.incoming.length}
                                </Badge>
                              </div>
                              {gateway.incoming.find(
                                (flow: any) => flow.expression === ""
                              ) && (
                                <div className="text-xs text-red-600 flex items-center">
                                  <Info className="h-3 w-3 mr-1" />
                                  Some incoming flows not configured
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium flex items-center">
                                  <GitPullRequestArrow className="h-4 w-4 mr-1 text-green-500" />
                                  Outgoing Flows
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50"
                                >
                                  {gateway.outgoing.length}
                                </Badge>
                              </div>
                              {gateway.outgoing.find(
                                (flow: any) => flow.expression === ""
                              ) && (
                                <div className="text-xs text-red-600 flex items-center">
                                  <Info className="h-3 w-3 mr-1" />
                                  Some outgoing flows not configured
                                </div>
                              )}
                            </div>

                            <Separator className="my-2" />

                            <DialogContainer
                              type="gateway"
                              gateway={gateway}
                              onSubmit={(payload: UpdateWorkflowPayload) => {
                                updateWorkflowMutation.mutate(payload);
                              }}
                              formTitle="Gateway Configuration"
                              title={`Configure ${
                                gateway.name || `Gateway ${idx + 1}`
                              }`}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Configure Gateway
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
