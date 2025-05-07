"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

// Sample data for process execution metrics
const data = [
  {
    name: "Jan",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Feb",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Mar",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Apr",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "May",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Jun",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Jul",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Aug",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Sep",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Oct",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Nov",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
  {
    name: "Dec",
    completed: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          formatter={(value) => [`${value} processes`, undefined]}
          labelStyle={{ color: '#333' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar
          name="Completed"
          dataKey="completed"
          fill="#4ade80"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          name="Failed"
          dataKey="failed"
          fill="#f87171"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          name="Pending"
          dataKey="pending"
          fill="#facc15"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
