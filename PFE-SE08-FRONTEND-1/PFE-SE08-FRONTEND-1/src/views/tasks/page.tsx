import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { getTasksList } from "@/services/processes-services";
import { ErrorPage } from "../../components/error-page";
import { Task } from "./data/schema";
import { taskData } from "@/services/types";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  CheckCircle,
  AlertCircle,
  UserCheck,
  BarChart3,
  ClipboardList,
  Timer,
  FileText,
  UserX,
  Plus
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function TaskPage() {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const {
    data: tasksData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasksList,
  });

  const tasks: Task[] = tasksData?.map((task: taskData) => ({
    id: task.id,
    title: task.name,
    status: task.assignee ? "claimed" : "unclaimed",
    assign: task.assignee || "-",
  })) || [];

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assign !== "-" && task.assign.toLowerCase().includes(searchTerm.toLowerCase()));

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'claimed') return matchesSearch && task.status === 'claimed';
      if (statusFilter === 'unclaimed') return matchesSearch && task.status === 'unclaimed';
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'assignee':
          return a.assign.localeCompare(b.assign);
        default:
          return 0;
      }
    });

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Manage your current tasks and assignments
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{tasks.length} Total Tasks</span>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Create New Task
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Claimed Tasks</p>
                    <p className="text-2xl font-bold text-green-900">{tasks.filter(t => t.status === 'claimed').length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Unclaimed Tasks</p>
                    <p className="text-2xl font-bold text-amber-900">{tasks.filter(t => t.status === 'unclaimed').length}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-full">
                    <UserX className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Avg. Completion</p>
                    <p className="text-2xl font-bold text-purple-900">1.2h</p>
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
                      placeholder="Search tasks by title, ID, or assignee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="claimed">Claimed Only</SelectItem>
                      <SelectItem value="unclaimed">Unclaimed Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="assignee">Assignee</SelectItem>
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
                          className={viewMode === 'cards' ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
                          className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
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

          {/* Task Content */}
          {viewMode === 'list' && (
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-0">
                <DataTable data={filteredTasks} columns={columns} />
              </CardContent>
            </Card>
          )}

          {/* Card View - Simple version */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-gray-200 hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-500">ID: {task.id}</p>
                          </div>
                        </div>

                        <Badge className={`text-xs px-2 py-1 ${task.status === 'claimed'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                          {task.status === 'claimed' ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          )}
                          <span className="capitalize">{task.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Assignee:</span>
                          {task.assign !== "-" ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-xs">
                                {task.assign.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-700">{task.assign}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No tasks are currently available'}
                    </p>
                  </div>
                  {!searchTerm && (
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Task
                    </Button>
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