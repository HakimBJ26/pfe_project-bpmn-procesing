import { useState } from "react";
import { roles as initialRoles, permissions } from "@/data/acl-data";
import { Role } from "@/types/acl.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, MoreHorizontal, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewPermissionsDialogOpen, setIsViewPermissionsDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleCreateRole = () => {
    const selectedPermissionObjects = permissions.filter((p) =>
      selectedPermissions.includes(p.id)
    );

    const role: Role = {
      id: crypto.randomUUID(),
      name: newRole.name || "",
      description: newRole.description || "",
      permissions: selectedPermissionObjects,
      creationTimestamp: new Date().toISOString(),
      updateTimestamp: new Date().toISOString(),
    };

    setRoles([...roles, role]);
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    });
    setSelectedPermissions([]);
    setIsCreateDialogOpen(false);
  };

  const handleEditRole = () => {
    if (!currentRole) return;

    const selectedPermissionObjects = permissions.filter((p) =>
      selectedPermissions.includes(p.id)
    );

    const updatedRole = {
      ...currentRole,
      permissions: selectedPermissionObjects,
      updateTimestamp: new Date().toISOString(),
    };

    setRoles(
      roles.map((role) => (role.id === currentRole.id ? updatedRole : role))
    );
    setIsEditDialogOpen(false);
  };

  const handleDeleteRole = () => {
    if (!currentRole) return;

    setRoles(roles.filter((role) => role.id !== currentRole.id));
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const openEditDialog = (role: Role) => {
    setCurrentRole(role);
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setIsEditDialogOpen(true);
  };

  const openViewPermissionsDialog = (role: Role) => {
    setCurrentRole(role);
    setIsViewPermissionsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Roles List</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  placeholder="e.g., MANAGER, ANALYST, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  placeholder="Describe the purpose and scope of this role"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([
                                ...selectedPermissions,
                                permission.id,
                              ]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter(
                                  (id) => id !== permission.id
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-sm text-muted-foreground mt-2">
                  {selectedPermissions.length} permissions selected
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">
                    {role.name}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {role.description}
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => openViewPermissionsDialog(role)}
                  >
                    {role.permissions.length} permissions
                  </Button>
                </TableCell>
                <TableCell>{formatDate(role.creationTimestamp)}</TableCell>
                <TableCell>{formatDate(role.updateTimestamp)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openViewPermissionsDialog(role)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        View Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(role)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentRole(role);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions.
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={currentRole.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentRole({
                      ...currentRole,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentRole.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCurrentRole({
                      ...currentRole,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([
                                ...selectedPermissions,
                                permission.id,
                              ]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter(
                                  (id) => id !== permission.id
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`edit-permission-${permission.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-sm text-muted-foreground mt-2">
                  {selectedPermissions.length} permissions selected
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="py-4">
              <p>
                You are about to delete the role:{" "}
                <span className="font-semibold">{currentRole.name}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Users assigned to this role will need to be reassigned.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Permissions Dialog */}
      <Dialog
        open={isViewPermissionsDialogOpen}
        onOpenChange={setIsViewPermissionsDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentRole?.name} Permissions
            </DialogTitle>
            <DialogDescription>
              List of all permissions assigned to this role.
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="py-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {currentRole.permissions.length > 0 ? (
                    currentRole.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="p-3 border rounded-md"
                      >
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No permissions assigned to this role.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsViewPermissionsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
