import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { DataTableRowActions } from "./components/data-table-row-actions";

import { ErrorPage } from "../../components/error-page";
import { Toaster } from "../../components/ui/sonner";
import { FullScreenLoader } from "../../components/fullscreen-loader";
import { getWorkflowList } from "@/services/workflows-services";
import { useWorkflowStore } from "@/stores/workflows.store";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Workflow as WorkflowIcon,
  Play,
  Settings,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Cog
} from "lucide-react";
import { Workflow } from "./data/schema";
import { workflowData } from "@/services/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function WorkflowPage() {
  const { setWorkflows } = useWorkflowStore();
  const [displayWorkflows, setDisplayWorkflows] = useState<Workflow[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: workflowsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflowList,
  });

  useEffect(() => {
    // Update the workflow store
    if (workflowsData) {
      setWorkflows(workflowsData);

      // Convert to the expected Workflow type for display
      const convertedWorkflows: Workflow[] = workflowsData.map((workflow: workflowData) => ({
        ...workflow,
        readyToDeploy: true,
      }));

      setDisplayWorkflows(convertedWorkflows);
    }
  }, [workflowsData, setWorkflows]);

  // Filter workflows based on search term
  const filteredWorkflows = displayWorkflows.filter(workflow =>
    workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorPage />;

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
        {/* Modern Header Section */}
        <div className="mb-6">
          {/* Top Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <WorkflowIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Workflows
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage your business process automation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {filteredWorkflows.length} workflows
                </span>
              </div>
              <Link to="/workflow-builder">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-4 py-2">
                  <Plus className="mr-2 h-4 w-4" />
                  New Workflow
                </Button>
              </Link>
            </div>
          </div>

          {/* Toolbar Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search Section */}
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search workflows by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-100 bg-gray-50/50"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    } transition-all`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    } transition-all`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 hover:border-blue-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <WorkflowIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {workflow.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500 font-mono mt-1">
                          ID: {workflow.id.substring(0, 12)}...
                        </CardDescription>
                      </div>
                    </div>
                    <DataTableRowActions row={{ original: workflow, getIsSelected: () => false, toggleSelected: () => { }, getValue: (key: string) => workflow[key as keyof Workflow] }} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={workflow.readyToDeploy ? "default" : "secondary"}
                        className={workflow.readyToDeploy ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                      >
                        {workflow.readyToDeploy ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Ready to Deploy
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                            Draft
                          </>
                        )}
                      </Badge>
                      <Link to={`/workflow/${workflow.id}/config`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                          <Cog className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Created {formatDate(workflow.creationTimestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Updated {formatDate(workflow.updateTimestamp)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Modern List View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* List Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                  <div className="col-span-4">Workflow</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-2">Updated</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              </div>

              {/* List Content */}
              <div className="divide-y divide-gray-100">
                {filteredWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Workflow Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <WorkflowIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                            {workflow.title}
                          </h3>
                          <p className="text-sm text-gray-500 font-mono truncate">
                            ID: {workflow.id.substring(0, 16)}...
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge
                          variant={workflow.readyToDeploy ? "default" : "secondary"}
                          className={workflow.readyToDeploy ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${workflow.readyToDeploy ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {workflow.readyToDeploy ? 'Ready' : 'Draft'}
                        </Badge>
                      </div>

                      {/* Created Date */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {formatDate(workflow.creationTimestamp)}
                        </div>
                      </div>

                      {/* Updated Date */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {formatDate(workflow.updateTimestamp)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/workflow/${workflow.id}/config`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                              <Cog className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                        <DataTableRowActions row={{ original: workflow, getIsSelected: () => false, toggleSelected: () => { }, getValue: (key: string) => workflow[key as keyof Workflow] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional DataTable for comparison */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
                <h3 className="text-sm font-medium text-gray-700">Traditional Table View</h3>
              </div>
              <DataTable data={filteredWorkflows} columns={columns} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredWorkflows.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WorkflowIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or clear the search to see all workflows' : 'Get started by creating your first workflow to automate your business processes'}
              </p>
              {!searchTerm && (
                <Link to="/workflow-builder">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Workflow
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}