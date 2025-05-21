import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/components/date-range-picker";
import { Overview } from "@/components/dashboard/components/overview";
// ModeToggle removed - only light mode available
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  FileCheck2,
  Activity,
  Clock,
  FileText,
  Workflow,
  Layers,
  Bell,
  AlertCircle,
  CheckCircle2,
  BarChart,
  ArrowUpRight,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
// Separator import removed - not used
import { ScrollArea } from "@/components/ui/scroll-area";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    failed: "bg-red-100 text-red-800 hover:bg-red-200",
    pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    "in progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

  const statusKey = status.toLowerCase() as keyof typeof statusStyles;
  const style = statusStyles[statusKey] || "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={`${style} capitalize`}>
      {status}
    </Badge>
  );
}

// Recent notifications component
function RecentNotifications() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        <div className="flex items-start gap-4 rounded-lg border p-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Bell className="h-4 w-4 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">New task assigned</p>
            <p className="text-xs text-muted-foreground">You have been assigned a new approval task</p>
            <p className="text-xs text-muted-foreground">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border p-3">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Process completed</p>
            <p className="text-xs text-muted-foreground">Invoice approval process has been completed</p>
            <p className="text-xs text-muted-foreground">1 hour ago</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border p-3">
          <div className="rounded-full bg-red-100 p-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Process failed</p>
            <p className="text-xs text-muted-foreground">Data validation process has failed</p>
            <p className="text-xs text-muted-foreground">3 hours ago</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border p-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Task deadline approaching</p>
            <p className="text-xs text-muted-foreground">Review application task due in 2 hours</p>
            <p className="text-xs text-muted-foreground">5 hours ago</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// Process completion stats component
function ProcessCompletionStats() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">Completed</span>
          </div>
          <span className="text-sm font-medium">78%</span>
        </div>
        <Progress value={78} className="h-2 w-full" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <span className="text-sm font-medium">15%</span>
        </div>
        <Progress value={15} className="h-2 w-full bg-secondary" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium">Failed</span>
          </div>
          <span className="text-sm font-medium">7%</span>
        </div>
        <Progress value={7} className="h-2 w-full bg-secondary" />
      </div>
    </div>
  );
}

// Updated component to show recent tasks with improved styling
function RecentTasks() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-600">UT</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Review Application</p>
              <p className="text-xs text-muted-foreground">User Task • Due in 2 hours</p>
            </div>
          </div>
          <StatusBadge status="In Progress" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-green-100 text-green-600">ST</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Generate Report</p>
              <p className="text-xs text-muted-foreground">Service Task • Completed 30m ago</p>
            </div>
          </div>
          <StatusBadge status="Completed" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-purple-100 text-purple-600">BT</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Validate Customer Data</p>
              <p className="text-xs text-muted-foreground">Business Rule Task • Failed 1h ago</p>
            </div>
          </div>
          <StatusBadge status="Failed" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-600">UT</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Approve Payment</p>
              <p className="text-xs text-muted-foreground">User Task • Waiting for action</p>
            </div>
          </div>
          <StatusBadge status="Pending" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-orange-100 text-orange-600">ST</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Data Migration</p>
              <p className="text-xs text-muted-foreground">Script Task • Completed 2h ago</p>
            </div>
          </div>
          <StatusBadge status="Completed" />
        </div>
      </div>
    </ScrollArea>
  );
}

export default function DashboardPage() {
  const { username } = useAuthStore();
  const [processCount] = useState(24);
  const [workflowCount] = useState(18);
  const [taskCount, setTaskCount] = useState(42);
  const [formCount] = useState(15);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

  // This would be replaced with actual data fetching in a real implementation
  useEffect(() => {
    // Simulate data fetching
    const interval = setInterval(() => {
      setTaskCount(prev => prev + Math.floor(Math.random() * 3));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    // In a real app, this would trigger data fetching for the selected date range
  };

  return (
    <div className="flex flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Welcome back, <span className="font-medium text-gray-800 ml-1">{username || 'User'}</span>!
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            <CalendarDateRangePicker onDateRangeChange={handleDateRangeChange} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="relative hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">3</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-lg"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Active Processes
              </CardTitle>
              <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors duration-300">
                <Layers className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700">{processCount}</div>
              <div className="flex items-center pt-1">
                <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span className="font-medium">+12%</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">from last period</span>
              </div>
            </CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-2 group-hover:from-blue-100 group-hover:to-blue-200/50 transition-colors duration-300">
              <div className="text-xs font-medium flex items-center text-blue-700">
                <ArrowRight className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                <span>View details</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 rounded-lg"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Deployed Workflows
              </CardTitle>
              <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors duration-300">
                <Workflow className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-indigo-700">{workflowCount}</div>
              <div className="flex items-center pt-1">
                <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span className="font-medium">+5%</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">from last period</span>
              </div>
            </CardContent>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-6 py-2 group-hover:from-indigo-100 group-hover:to-indigo-200/50 transition-colors duration-300">
              <div className="text-xs font-medium flex items-center text-indigo-700">
                <ArrowRight className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                <span>View details</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-lg"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <div className="p-1.5 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors duration-300">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-700">{taskCount}</div>
              <div className="flex items-center pt-1">
                <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span className="font-medium">+18%</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">from last period</span>
              </div>
            </CardContent>
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 px-6 py-2 group-hover:from-green-100 group-hover:to-green-200/50 transition-colors duration-300">
              <div className="text-xs font-medium flex items-center text-green-700">
                <ArrowRight className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                <span>View details</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-lg"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Form Templates
              </CardTitle>
              <div className="p-1.5 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors duration-300">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-700">{formCount}</div>
              <div className="flex items-center pt-1">
                <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span className="font-medium">+7%</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">from last period</span>
              </div>
            </CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-6 py-2 group-hover:from-purple-100 group-hover:to-purple-200/50 transition-colors duration-300">
              <div className="text-xs font-medium flex items-center text-purple-700">
                <ArrowRight className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                <span>View details</span>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white border shadow-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
              <BarChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="processes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
              <Layers className="h-4 w-4 mr-2" />
              Processes
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
              <FileCheck2 className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Process Execution Metrics</CardTitle>
                  <CardDescription>
                    {selectedDateRange?.from && selectedDateRange?.to ? (
                      <>
                        {format(selectedDateRange.from, "MMM dd, yyyy")} - {format(selectedDateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      "Monthly process execution statistics"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Process Completion</CardTitle>
                  <CardDescription>
                    Distribution of process statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProcessCompletionStats />
                </CardContent>
                <CardFooter className="border-t px-6 py-3">
                  <Button variant="ghost" className="w-full justify-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    View detailed report
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Tasks</CardTitle>
                    <Badge variant="outline" className="text-xs font-normal">
                      {taskCount} total
                    </Badge>
                  </div>
                  <CardDescription>
                    Your assigned tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <RecentTasks />
                </CardContent>
                <CardFooter className="border-t px-6 py-3">
                  <Button variant="ghost" className="w-full justify-center">
                    <Clock className="mr-2 h-4 w-4" />
                    View all tasks
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>
                    Latest updates and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <RecentNotifications />
                </CardContent>
                <CardFooter className="border-t px-6 py-3">
                  <Button variant="ghost" className="w-full justify-center">
                    <Bell className="mr-2 h-4 w-4" />
                    View all notifications
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="processes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-lg"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Process Management</CardTitle>
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                  <CardDescription>
                    View and manage your BPMN processes
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white shadow-sm">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Invoice Approval</h4>
                          <p className="text-xs text-muted-foreground">Last updated 2 days ago</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white shadow-sm">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Customer Onboarding</h4>
                          <p className="text-xs text-muted-foreground">Last updated 5 days ago</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white shadow-sm">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Expense Reimbursement</h4>
                          <p className="text-xs text-muted-foreground">Last updated 1 week ago</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Draft</Badge>
                    </div>
                  </div>
                </CardContent>
                <div className="relative z-10 border-t p-4 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    <Activity className="mr-2 h-4 w-4" />
                    View All Processes
                  </Button>
                </div>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 rounded-lg"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Create New Process</CardTitle>
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <CardDescription>
                    Start building a new BPMN process
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="rounded-lg border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center h-[220px] bg-indigo-50/50">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                      <Layers className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium text-indigo-700">Create a New Process</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
                      Design and deploy new BPMN processes to automate your business workflows
                    </p>
                  </div>
                </CardContent>
                <div className="relative z-10 border-t p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Process
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
                <CardDescription>
                  View and manage your deployed workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 flex items-center justify-center h-[300px]">
                  <div className="text-center space-y-3">
                    <Workflow className="h-10 w-10 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Workflow Management</h3>
                    <p className="text-sm text-muted-foreground max-w-md">Access all your workflows, deploy new ones, or modify existing workflows.</p>
                    <Button className="mt-2">
                      <Workflow className="mr-2 h-4 w-4" />
                      View All Workflows
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  View and complete your assigned tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 flex items-center justify-center h-[300px]">
                  <div className="text-center space-y-3">
                    <FileCheck2 className="h-10 w-10 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Task Management</h3>
                    <p className="text-sm text-muted-foreground max-w-md">Access all your tasks, complete pending tasks, or view task history.</p>
                    <Button className="mt-2">
                      <Clock className="mr-2 h-4 w-4" />
                      View All Tasks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
