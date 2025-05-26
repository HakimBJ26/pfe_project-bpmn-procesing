import { Row } from "@tanstack/react-table";
import {
  Delete,
  Edit,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Share2,
  Star,
  Archive
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { formSchema } from "../data/schema";

import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { deleteFormService } from "@/services/form-services";
import { useFormsStore } from "@/stores/forms.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { deleteForm } = useFormsStore();
  const form = formSchema.parse(row.original);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteFormService,
    onSuccess: () => {
      deleteForm(form.formKey);
      toast.success("Form deleted successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onError: (error: Error) => {
      toast.error(`Error deleting form: ${error.message}`);
    },
  });

  const handleDeleteForm = () => {
    deleteMutation.mutate(form.id);
    setShowDeleteDialog(false);
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

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
          <DropdownMenuLabel className="text-gray-700 font-medium">Form Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <Link to={`/form-builder/${form.formKey}`}>
            <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
              <Edit className="mr-2 h-4 w-4 text-blue-600" />
              <span>Edit Form</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50">
            <Eye className="mr-2 h-4 w-4 text-gray-600" />
            <span>Preview Form</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => copyToClipboard(form.id, 'Form ID')}
            className="hover:bg-gray-50 focus:bg-gray-50"
          >
            <Copy className="mr-2 h-4 w-4 text-gray-600" />
            <span>Copy Form ID</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => copyToClipboard(form.formKey, 'Form Key')}
            className="hover:bg-gray-50 focus:bg-gray-50"
          >
            <Copy className="mr-2 h-4 w-4 text-gray-600" />
            <span>Copy Form Key</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="hover:bg-green-50 focus:bg-green-50">
            <Download className="mr-2 h-4 w-4 text-green-600" />
            <span>Export Form</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
            <Share2 className="mr-2 h-4 w-4 text-blue-600" />
            <span>Share Form</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-yellow-50 focus:bg-yellow-50">
            <Star className="mr-2 h-4 w-4 text-yellow-600" />
            <span>Add to Favorites</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50">
            <Archive className="mr-2 h-4 w-4 text-gray-600" />
            <span>Archive Form</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="hover:bg-red-50 focus:bg-red-50 text-red-600"
          >
            <Delete className="mr-2 h-4 w-4" />
            <span>Delete Form</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}