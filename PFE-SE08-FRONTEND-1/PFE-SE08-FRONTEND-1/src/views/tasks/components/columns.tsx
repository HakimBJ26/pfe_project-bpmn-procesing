

import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Task } from "../data/schema"
import { statuses } from "../data/data"
import { FileText, UserX } from "lucide-react"

export const columns: ColumnDef<Task>[] = [
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
      <DataTableColumnHeader column={column} title="Task Id" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] truncate font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md" title={row.getValue("id")}>
        {row.getValue("id")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 items-center">
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
            <FileText className="h-4 w-4" />
          </div>
          <span className="max-w-[500px] truncate font-medium text-gray-700 hover:text-blue-600 transition-colors">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "assign",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned" />
    ),
    cell: ({ row }) => {
      const assignee = row.getValue("assign");
      const isAssigned = assignee !== "-";

      return (
        <div className="flex items-center">
          {isAssigned ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                {assignee.toString().charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{assignee}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic flex items-center">
              <UserX className="h-4 w-4 mr-2 text-gray-400" />
              Unassigned
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      const statusStyles = {
        claimed: "bg-green-100 text-green-800 border-green-200",
        unclaimed: "bg-amber-100 text-amber-800 border-amber-200",
      }

      const statusClass = status.value === "claimed" ? statusStyles.claimed : statusStyles.unclaimed;

      return (
        <div className="flex items-center">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass} flex items-center`}>
            {status.icon && (
              <status.icon className="mr-1.5 h-3.5 w-3.5" />
            )}
            <span>{status.label}</span>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  // {
  //   accessorKey: "priority",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Priority" />
  //   ),
  //   cell: ({ row }) => {
  //     const priority = priorities.find(
  //       (priority) => priority.value === row.getValue("priority")
  //     )

  //     if (!priority) {
  //       return null
  //     }

  //     return (
  //       <div className="flex items-center">
  //         {priority.icon && (
  //           <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{priority.label}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
