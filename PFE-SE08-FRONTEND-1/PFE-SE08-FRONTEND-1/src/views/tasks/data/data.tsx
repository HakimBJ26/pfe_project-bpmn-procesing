import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "claimed",
    label: "Claimed",
    icon: CheckCircle,
  },
  {
    value: "unclaimed",
    label: "Unclaimed",
    icon: Circle,
  }
  // {
  //   value: "in progress",
  //   label: "In Progress",
  //   icon: Timer,
  // },
  // {
  //   value: "done",
  //   label: "Done",
  //   icon: CheckCircle,
  // },
  // {
  //   value: "canceled",
  //   label: "Canceled",
  //   icon: CircleOff,
  // },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
]
