
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  User,
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Users,
  Shield
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Dark mode init */
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
  }, []);

  /* Close sidebar when route changes */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const getInitials = (name: string = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* Navigation Items */
  const navigationItems =
    user?.role === "admin"
      ? [
          { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Employees", path: "/employees", icon: Users },
          { name: "Leaves", path: "/leaves", icon: ClipboardList },
          { name: "Attendance", path: "/attendance", icon: CalendarCheck }
        ]
      : [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "Leaves", path: "/leaves", icon: ClipboardList },
          { name: "Attendance", path: "/attendance", icon: CalendarCheck },
          { name: "Profile", path: "/profile", icon: User }
        ];

  if (!user) {
  return <Navigate to="/login" replace />;
}
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all
        ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-md"
            : "bg-white dark:bg-gray-900 border-b"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                E
              </div>

              <h1 className="hidden sm:block font-bold text-lg">
                {user?.role === "admin"
                  ? "Admin Portal"
                  : "Attendance System"}
              </h1>

              {user?.role === "admin" && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" /> Admin
                </Badge>
              )}
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* Dark Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </Button>

            {/* Notification */}
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>

            {/* PROFILE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${user?.name}`}
                    />
                    <AvatarFallback>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <ChevronDown className="hidden md:block h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">

                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <NavLink
                    to={user?.role === "admin" ? "/profile" : "/profile"}
                    className="flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </NavLink>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 z-50
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:hidden transition-transform duration-300`}
      >
        <div className="p-6 border-b">
          <h2 className="font-bold text-lg">
            {user?.role === "admin" ? "Admin Portal" : "Attendance"}
          </h2>
        </div>

        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t z-50">
        <div className="flex justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center text-xs
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="pt-16 pb-20 lg:pb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

