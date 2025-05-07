import { ReactNode, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  PencilSquareIcon,
  RectangleStackIcon,
  ServerIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import {
  AlignLeft,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LogOut,
  PanelRightClose,
} from "lucide-react";
import { Button } from "./ui/button";
import { useSessionStorage } from "usehooks-ts";

function classNames(...classes: any[]): string {
  return classes.filter(Boolean).join(" ");
}

interface SideBarProps {
  children: ReactNode;
}

export default function SideBar({ children }: SideBarProps) {
  const [sidebarOpen, setSidebarOpen] = useSessionStorage<boolean>(
    "sidebar:open",
    true
  );
  const [isCollapsed, setIsCollapsed] = useSessionStorage<boolean>(
    "sidebar:state",
    false
  ); // State for collapsing the sidebar
  const location = useLocation();

  const navigation = [
    {
      name: "Tasks",
      href: "/tasks",
      icon: RectangleStackIcon,
      current: location.pathname === "/tasks",
    },
    {
      name: "Processes",
      href: "/processes",
      icon: ServerIcon,
      current: location.pathname === "/processes",
    },
    {
      name: "Bpmn Modeler",
      href: "/workflow-builder",
      icon: PencilSquareIcon,
      current: location.pathname === "/workflow-builder",
    },
    {
      name: "Form Builder",
      href: "/form-builder",
      icon: AlignLeft,
      current: location.pathname === "/form-builder",
    },
    {
      name: "Decision Model Builder",
      href: "/dmn-builder",
      icon: TableCellsIcon,
      current: location.pathname === "/dmn-builder",
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div>
        {/* Mobile Sidebar */}
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 xl:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <Button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </Button>
                </div>
              </TransitionChild>
              {/* Sidebar component for mobile */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
                <a href="/">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      alt="Wevioo"
                      src="https://www.wevioo.com/sites/default/files/logo_0.png"
                      className="h-8 w-auto invert"
                    />
                  </div>
                </a>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className="h-6 w-6 shrink-0"
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                      <a
                        href="#"
                        className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                      >
                        <img
                          alt=""
                          src="https://avatars.githubusercontent.com/u/57048839?v=4"
                          className="h-8 w-8 rounded-full bg-gray-800"
                        />
                        <span className="sr-only">Your profile</span>
                        <span aria-hidden="true">Aziz Souabni</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop Sidebar */}
        <div
          className={`hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex ${
            isCollapsed ? "xl:w-20" : "xl:w-72"
          } xl:flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
            <a href="/">
              <div className="flex justify-center h-16 shrink-0 items-center rounded-full">
                <img
                  alt="Wevioo"
                  src={`${isCollapsed ? "w_logo_cropped.png" : "w_logo.png"}`}
                  className="h-auto w-auto invert"
                />
              </div>
            </a>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li
                        key={item.name}
                        className={
                          isCollapsed ? "flex items-center justify-center" : ""
                        }
                      >
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="h-6 w-6 shrink-0"
                          />
                          {!isCollapsed && item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <Button
                    onClick={toggleSidebar}
                    className="text-white p-2 hover:bg-gray-800 rounded-md flex items-center justify-center w-full"
                  >
                    {isCollapsed ? (
                      <ArrowRightFromLine />
                    ) : (
                      <ArrowLeftFromLine />
                    )}
                  </Button>
                  <a
                    href="/account-details"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                  >
                    <img
                      alt=""
                      src="https://avatars.githubusercontent.com/u/57048839?v=4"
                      className="h-8 w-8 rounded-full bg-gray-800"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="sr-only">Your profile</span>
                        <span aria-hidden="true">Aziz Souabni</span>
                      </>
                    )}
                  </a>
                  <Button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="text-white p-2 hover:bg-gray-800 rounded-md flex items-center justify-center w-full"
                  >
                    <LogOut />
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isCollapsed ? "xl:pl-20" : "xl:pl-72"}`}>
          {children}
          <Button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-8 left-8 p-3 bg-blue-900 hover:bg-blue-800 text-white rounded-full shadow-lg  transition-colors xl:hidden"
          >
            <PanelRightClose className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
}
