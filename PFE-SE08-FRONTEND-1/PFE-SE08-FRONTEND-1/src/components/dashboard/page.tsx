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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Modern Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Redesigned Header */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Section - Welcome */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <BarChart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Welcome back, {username || 'User'}!
                </h1>
                <p className="text-gray-600 font-medium mt-1">Here's what's happening with your workflows today</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-semibold">All Systems Operational</span>
                  </div>
                  <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {/* Right Section - Quick Actions */}
            <div className="flex items-center space-x-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-1">
                <CalendarDateRangePicker onDateRangeChange={handleDateRangeChange} />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="relative w-12 h-12 bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white hover:shadow-xl transition-all duration-300 group rounded-2xl"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                  3
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Redesigned Statistics Grid */}
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {/* Process Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/30 to-transparent rounded-full blur-xl"></div>

              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Layers className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-800 mb-1">{processCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Processes</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Active</span>
                    <span className="text-sm font-bold text-blue-600">18</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">+12% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-400/30 to-transparent rounded-full blur-xl"></div>

              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Workflow className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-800 mb-1">{workflowCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflows</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Deployed</span>
                    <span className="text-sm font-bold text-indigo-600">15</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">+5% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-400/30 to-transparent rounded-full blur-xl"></div>

              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <FileCheck2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-800 mb-1">{taskCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Pending</span>
                    <span className="text-sm font-bold text-green-600">28</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">+18% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-full blur-xl"></div>

              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-800 mb-1">{formCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Forms</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Templates</span>
                    <span className="text-sm font-bold text-purple-600">12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">+7% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Redesigned Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <BarChart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Process Analytics</CardTitle>
                      <CardDescription className="text-gray-600 font-medium mt-1">
                        {selectedDateRange?.from && selectedDateRange?.to ? (
                          <>
                            {format(selectedDateRange.from, "MMM dd, yyyy")} - {format(selectedDateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          "Real-time workflow performance metrics"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-600">Live Data</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Overview />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Process Completion */}
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Completion Rate</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">Process success metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ProcessCompletionStats />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">Common workflow tasks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg rounded-xl">
                  <Layers className="mr-3 h-4 w-4" />
                  Create Process
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg rounded-xl">
                  <Workflow className="mr-3 h-4 w-4" />
                  Deploy Workflow
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-xl">
                  <FileText className="mr-3 h-4 w-4" />
                  New Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Recent Tasks</CardTitle>
                    <CardDescription className="text-gray-600">Your latest assignments</CardDescription>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
                  {taskCount} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentTasks />
            </CardContent>
            <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-xl">
                <Clock className="mr-2 h-4 w-4" />
                View All Tasks
              </Button>
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Activity Feed</CardTitle>
                  <CardDescription className="text-gray-600">Latest system updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentNotifications />
            </CardContent>
            <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg rounded-xl">
                <Bell className="mr-2 h-4 w-4" />
                View All Notifications
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
