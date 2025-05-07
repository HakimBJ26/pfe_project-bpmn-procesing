import {
  getProcessList,
  startProcessService,
} from "@/services/processes-services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FullScreenLoader } from "@/components/fullscreen-loader";

import { ErrorPage } from "@/components/error-page";
import { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/views/processes/confirmation-dialog";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner";

// Define the possible statuses
type Status = "offline" | "online" | "error";

// Define the statuses object with the correct type
const statuses: Record<Status, string> = {
  offline: "text-gray-500 bg-gray-100/10",
  online: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes: any[]): string {
  return classes.filter(Boolean).join(" ");
}

type Process = {
  id: string;
  name: string;
  key: string;
  version: number;
};

function Processes() {
  const [open, setOpen] = useState(false);
  const [process, setProcess] = useState<Process | null>(null);
  const {
    data: processList,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: getProcessList,
  });

  const startProcessMutation = useMutation({
    mutationFn: () => startProcessService(process?.key || ""),
    onSuccess: (message: string) => {
      toast(message);
    },
    onError: (message: string) => {
      console.log("Process start failed");
      toast(message);
    },
  });

  const handleStartProcess = () => {
    startProcessMutation.mutate()
  };

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return <ErrorPage />;
  }
  return (
    <>
      {/* Sticky search header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
        <ConfirmationDialog
          setOpen={setOpen}
          open={open}
          process={process}
          handleStartProcess={handleStartProcess}
        />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form action="#" method="GET" className="flex flex-1">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
              />
              <input
                id="search-field"
                name="search"
                type="search"
                placeholder="Search..."
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      <main className="w-full">
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-white">
            Deployed processes
          </h1>

          {/* Sort dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-x-1 text-sm font-medium leading-6 text-white">
              Sort by
              <ChevronUpDownIcon
                aria-hidden="true"
                className="h-5 w-5 text-gray-500"
              />
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <MenuItem>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                >
                  Name
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                >
                  Date updated
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                >
                  Environment
                </a>
              </MenuItem>
            </MenuItems>
          </Menu>
        </header>

        {/* Deployment list */}
        <ul role="list" className="divide-y divide-white/5">
          {processList &&
            processList.map((process) => (
              <li
                key={process.id}
                className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 cursor-pointer hover:bg-slate-800"
                onClick={() => {
                  setOpen(true);
                  setProcess({
                    id: process.id,
                    key: process.key,
                    name: process.name,
                    version: process.version,
                  });
                }}
              >
                <div className="min-w-0 flex-auto">
                  <div className="flex items-center gap-x-3">
                    <div
                      className={classNames(
                        statuses["online"],
                        "flex-none rounded-full p-1"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                      <div
                        className="flex gap-x-2"
                      >
                        <span className="truncate">{process.name}</span>
                        <span className="text-gray-400">/</span>
                        <span className="whitespace-nowrap">
                          {process.resourceName}
                        </span>
                        <span className="absolute inset-0" />
                      </div>
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                    Process definition key :{" "}
                    <p className="truncate">{process.id}</p>
                    <svg
                      viewBox="0 0 2 2"
                      className="h-0.5 w-0.5 flex-none fill-gray-300"
                    >
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <p className="whitespace-nowrap">
                      Version {process.version}
                    </p>
                  </div>
                </div>
                <Button className="text-white p-0">
                  <Play />
                </Button>
              </li>
            ))}
        </ul>
      </main>

      {/* Processes */}
      {/* <aside className="bg-black/10 lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-white/5">
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h2 className="text-base font-semibold leading-7 text-white">
            Processes
          </h2>
          <a
            href="/processes"
            className="text-sm font-semibold leading-6 text-indigo-400"
          >
            View all
          </a>
        </header>
        <ul role="list" className="divide-y divide-white/5">
          {processList &&
            processList.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-x-3">
                  <div
                    className={classNames(
                      statuses["online"],
                      "flex-none rounded-full p-1"
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-white">
                    {item.name}
                  </h3>

                  <Button
                    className="text-white p-0"
                    onClick={() => {
                      setOpen(true);
                      setProcess({
                        id: item.id,
                        key: item.key,
                        name: item.name,
                        version: item.version,
                      });
                    }}
                  >
                    <Play />
                  </Button>
                </div>
                <p className="mt-3 truncate text-sm text-gray-500">
                  Version :{" "}
                  <span className="font-mono text-gray-400">
                    {" "}
                    {item.version}{" "}
                  </span>{" "}
                </p>
              </li>
            ))}
        </ul>
      </aside> */}
      <Toaster />
    </>
  );
}

export default Processes;
