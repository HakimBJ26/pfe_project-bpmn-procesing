import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Form } from "../data/schema";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Helper function for copying text to clipboard
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      toast.success(`${label} copied to clipboard`, {
        description: text,
        duration: 2000,
      });
    },
    (err) => {
      toast.error(`Could not copy ${label.toLowerCase()}`, {
        description: "Please try again",
      });
      console.error('Could not copy text: ', err);
    }
  );
};

// Component for copy button with tooltip
const CopyButton = ({ value, label }: { value: string, label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(value, label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-1 text-gray-400 hover:text-gray-600"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy {label.toLowerCase()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const columns: ColumnDef<Form>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Form ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <div className="flex items-center">
          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-[180px] truncate" title={id}>
            {id}
          </div>
          <CopyButton value={id} label="Form ID" />
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "formKey",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Form Key" />
    ),
    cell: ({ row }) => {
      const formKey = row.getValue("formKey") as string;
      return (
        <div className="flex items-center">
          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-[180px] truncate" title={formKey}>
            {formKey}
          </div>
          <CopyButton value={formKey} label="Form Key" />
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "creationTimestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = parseISO(row.getValue("creationTimestamp"));
      return (
        <div className="flex space-x-2">
          <span className="font-medium">
            {format(date, 'yyyy-MM-dd HH:mm:ss')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updateTimestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const date = parseISO(row.getValue("updateTimestamp"));
      return (
        <div className="flex space-x-2">
          <span className="font-medium">{format(date, 'yyyy-MM-dd HH:mm:ss')}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]; 