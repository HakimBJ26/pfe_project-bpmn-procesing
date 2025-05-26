import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getProcessList } from "@/services/processes-services";
import { processData } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Settings,
  MoreVertical,
  Eye,
  Play,
  Pause,
  Copy,
  Download,
  Share2,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Star,
  Archive,
  BarChart3,
  Users,
  Workflow,
  Timer,
  ShieldCheck,
  ShieldMinus
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { startProcessService } from "@/services/processes-services";

export default function ProcessPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const {
    data: processesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: getProcessList,
  });

  // Extend the process type to include computed properties
  const processes = processesData?.map((process: processData) => ({
    ...process,
    status: process.suspended ? "suspended" : "active",
    title: process.resourceName.replace('.bpmn', '')
  })) || [];

  // Filter and sort processes
  const filteredProcesses = processes
    .filter(process => {
      const matchesSearch = process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.key.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active') return matchesSearch && !process.suspended;
      if (statusFilter === 'suspended') return matchesSearch && process.suspended;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'version':
          return b.version - a.version;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'suspended': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${type} copied to clipboard`, {
          description: text,
          duration: 2000,
        });
      },
      (err) => {
        toast.error(`Could not copy ${type.toLowerCase()}`, {
          description: "Please try again",
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  // Start process mutation
  const startProcessMutation = useMutation({
    mutationFn: (processKey: string) => startProcessService(processKey),
    onSuccess: (message: string) => {
      toast.success("Process started successfully", {
        description: message,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to start process", {
        description: error.message || "Please try again",
      });
    },
  });

  const handleStartProcess = (processKey: string) => {
    startProcessMutation.mutate(processKey);
  };

  const handleViewProcess = (processId: string) => {
    // This will be handled by the existing DataTableRowActions component
    toast.info("Opening process viewer...", {
      description: `Process ID: ${processId}`,
    });
  };

  const handleActivateProcess = (processKey: string) => {
    toast.info("Activate process functionality", {
      description: "This feature is still in development",
    });
  };

  const stillInDev = (action: string) => {
    toast.info(`${action} functionality`, {
      description: "This feature is still in development",
    });
  };

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl shadow-lg">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Process Management</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Manage and monitor your business processes
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{processes.length} Total Processes</span>
              </div>
              <Link to="/process-builder">
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Process
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Active Processes</p>
                    <p className="text-2xl font-bold text-green-900">{processes.filter(p => !p.suspended).length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Suspended Processes</p>
                    <p className="text-2xl font-bold text-red-900">{processes.filter(p => p.suspended).length}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Instances</p>
                    <p className="text-2xl font-bold text-blue-900">{processes.length * 8}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Avg. Execution Time</p>
                    <p className="text-2xl font-bold text-purple-900">2.4h</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Timer className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Controls */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search processes by name, ID, or key..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="suspended">Suspended Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="version">Version</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className={viewMode === 'cards' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Card View</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List View</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Content */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProcesses.map((process) => (
                <Card key={process.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-gray-200 hover:border-green-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg">
                          <Workflow className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                            {(process as any).title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs px-2 py-1 ${getStatusColor((process as any).status)}`}>
                              {getStatusIcon((process as any).status)}
                              <span className="ml-1 capitalize">{(process as any).status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{process.version}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Process Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!process.suspended && (
                            <DropdownMenuItem
                              onClick={() => handleStartProcess(process.key)}
                              disabled={startProcessMutation.isPending}
                            >
                              <Play className="mr-2 h-4 w-4 text-green-600" />
                              {startProcessMutation.isPending ? "Starting..." : "Start Process"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleViewProcess(process.id)}>
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            View Process
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(process.id, 'Process ID')}>
                            <Copy className="mr-2 h-4 w-4 text-gray-600" />
                            Copy Process ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(process.key, 'Process Key')}>
                            <Copy className="mr-2 h-4 w-4 text-gray-600" />
                            Copy Process Key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => stillInDev("Export BPMN")}>
                            <Download className="mr-2 h-4 w-4 text-green-600" />
                            Export BPMN
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => stillInDev("Share Process")}>
                            <Share2 className="mr-2 h-4 w-4 text-blue-600" />
                            Share Process
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => stillInDev("Add to Favorites")}>
                            <Star className="mr-2 h-4 w-4 text-yellow-600" />
                            Add to Favorites
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => process.suspended ? handleActivateProcess(process.key) : stillInDev("Suspend Process")}>
                            {process.suspended ? (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
                                Activate Process
                              </>
                            ) : (
                              <>
                                <ShieldMinus className="mr-2 h-4 w-4 text-red-600" />
                                Suspend Process
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Process ID</p>
                          <div className="flex items-center gap-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate max-w-[100px]">
                              {process.id}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(process.id, 'Process ID')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Process Key</p>
                          <div className="flex items-center gap-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate max-w-[100px]">
                              {process.key}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(process.key, 'Process Key')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Deployment: {process.deploymentId.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>Version {process.version}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {!process.suspended ? (
                          <Button
                            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                            onClick={() => handleStartProcess(process.key)}
                            disabled={startProcessMutation.isPending}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {startProcessMutation.isPending ? "Starting..." : "Start Process"}
                          </Button>
                        ) : (
                          <Button
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => handleActivateProcess(process.key)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3"
                          onClick={() => handleViewProcess(process.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-0">
                <DataTable data={filteredProcesses} columns={columns} />
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredProcesses.length === 0 && (
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Workflow className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">No processes found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first process'}
                    </p>
                  </div>
                  {!searchTerm && (
                    <Link to="/process-builder">
                      <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Process
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}