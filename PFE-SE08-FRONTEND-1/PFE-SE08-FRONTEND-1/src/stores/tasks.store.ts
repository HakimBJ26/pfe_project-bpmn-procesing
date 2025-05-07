import { secureStorage } from "@/lib/secureStorage";
import { taskData } from "@/services/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type TasksState = {
    tasks: taskData[];
    getTask: (id: string) => taskData | null;
    setTasks: (tasksData: taskData[]) => void;
    claimTask: (taskId: string, userId: string) => void;
    clearError: () => void;
};

export const useTaskStore = create<TasksState>()(
    persist(
        (set, get) => ({
            tasks: [],
            getTask: (id: string) => {
                const task = get().tasks.find(task => task.id === id);
                return task || null;
            },
            setTasks: (tasksData: taskData[]) => {
                set({
                    tasks: tasksData,
                });
            },
            
            clearError: () => {
            },
            claimTask: async (taskId: string, userId: string) => {
                const tasks = get().tasks.map(task => {
                    if (task.id === taskId) {
                        task.assignee = userId;
                    }
                    return task;
                });
                set({
                    tasks: tasks,
                });
            }
        }),
        {
            name: "tasks-storage",
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                tasks: state.tasks,
            }),
        }
    )
);