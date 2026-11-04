
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Store,
  Package,
  Truck,
  ReceiptText,
  LogOut,
  UtensilsCrossed,
  Bell,
  ChefHat,
  Trash2,
  History,
  CheckCheck,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  BrainCircuit,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const navItems = [
  {
    name: "Command Center",
    path: "/dashboard/overview",
    icon: LayoutDashboard,
    roles: ["OWNER"],
  },
  {
    name: "Branches & Franchises",
    path: "/dashboard/branches",
    icon: Store,
    roles: ["OWNER"],
  },
  {
    name: "Inventory & Stock",
    path: "/dashboard/inventory",
    icon: Package,
    roles: ["OWNER", "BRANCH_MANAGER", "FRANCHISE_MANAGER"],
  },
  {
    name: "Demand Forecast",
    path: "/dashboard/forecast",
    icon: BrainCircuit,
    roles: ["OWNER", "BRANCH_MANAGER"],
  },
  {
    name: "Recipe Management",
    path: "/dashboard/recipes",
    icon: ChefHat,
    roles: ["OWNER", "BRANCH_MANAGER"],
  },
  {
    name: "Wastage Management",
    path: "/dashboard/wastage",
    icon: Trash2,
    roles: ["OWNER", "BRANCH_MANAGER"],
  },
  {
    name: "Supply Requests",
    path: "/dashboard/requests",
    icon: Truck,
    roles: ["OWNER", "BRANCH_MANAGER", "FRANCHISE_MANAGER"],
  },
  {
    name: "Sales History",
    path: "/dashboard/sales-history",
    icon: History,
    roles: ["OWNER", "BRANCH_MANAGER", "FRANCHISE_MANAGER", "STAFF"],
  },
  {
    name: "POS & Billing",
    path: "/dashboard/pos",
    icon: ReceiptText,
    roles: ["OWNER", "BRANCH_MANAGER", "FRANCHISE_MANAGER", "STAFF"],
  },
];

const roleLabels = {
  OWNER: "Business Owner",
  BRANCH_MANAGER: "Branch Manager",
  FRANCHISE_MANAGER: "Franchise Manager",
  STAFF: "Staff Member",
};

const severityStyles = {
  INFO: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  WARNING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  CRITICAL: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  SUCCESS: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const getNotificationTime = (date) => {
  if (!date) return "Recently";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return "Recently";

  const difference = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Date(date).toLocaleDateString();
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const notificationRef = useRef(null);

  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("dineops_user") || "null"
    );
  } catch {
    user = null;
  }

  const userName = user?.name || "DineOps User";
  const userRole = roleLabels[user?.role] || "Team Member";

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const activeItem = visibleNavItems.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  const activePage = activeItem?.name || "Dashboard";

  const roleScope = {
    OWNER: "Business Overview",
    BRANCH_MANAGER: "Branch Operations",
    FRANCHISE_MANAGER: "Franchise Operations",
    STAFF: "Point of Sale",
  };

  const getAuthHeaders = useCallback(() => {
    const token = sessionStorage.getItem("dineops_token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const fetchNotifications = useCallback(
    async (showLoader = false) => {
      const token = sessionStorage.getItem("dineops_token");

      if (!token) {
        setNotificationError("Please sign in again.");
        return;
      }

      if (showLoader) {
        setNotificationLoading(true);
      }

      try {
        setNotificationError("");

        const [
          notificationsResponse,
          countResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/notifications?limit=20`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE_URL}/notifications/unread-count`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
        ]);

        if (
          !notificationsResponse.ok ||
          !countResponse.ok
        ) {
          throw new Error("Unable to load notifications.");
        }

        const notificationsData =
          await notificationsResponse.json();

        const countData = await countResponse.json();

        setNotifications(
          Array.isArray(notificationsData.notifications)
            ? notificationsData.notifications
            : []
        );

        setUnreadCount(
          Number(
            countData.unreadCount ??
              notificationsData.unreadCount ??
              0
          )
        );
      } catch (error) {
        console.error("Fetch Notifications Error:", error);
        setNotificationError(
          error.message || "Something went wrong."
        );
      } finally {
        if (showLoader) {
          setNotificationLoading(false);
        }
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error("Mark Notification Read Error:", error);
      setNotificationError(error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update notifications."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark All Notifications Read Error:", error);
      setNotificationError(error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("dineops_token");
    sessionStorage.removeItem("dineops_user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 md:flex">
        <div>
          <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
            <div className="rounded-lg bg-amber-500 p-2 text-slate-950">
              <UtensilsCrossed size={20} />
            </div>

            <div>
              <h1 className="font-bold tracking-wide text-white">
                DineOps
              </h1>

              <p className="text-xs font-medium text-amber-500">
                Pindi Junction
              </p>
            </div>
          </div>

          <div className="px-4 pb-2 pt-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Management
            </p>
          </div>

          <nav className="space-y-1 px-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem?.path === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-amber-500 font-semibold text-slate-950 shadow-lg shadow-amber-500/10"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-sm font-bold text-amber-400">
              {initials || "DO"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>

              <p className="text-xs text-slate-400">
                {userRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg border border-rose-500/20 px-3 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-5 md:px-8">
          <div>
            <h2 className="text-base font-bold text-white">
              {activePage}
            </h2>

            <p className="text-xs text-slate-500">
              {roleScope[user?.role] || "DineOps Workspace"} ·
              Welcome back, {userName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-amber-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {userRole}
            </div>

            {/* Notification Bell */}
            <div
              className="relative"
              ref={notificationRef}
            >
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() => {
                  const nextState = !notificationOpen;

                  setNotificationOpen(nextState);

                  if (nextState) {
                    fetchNotifications(true);
                  }
                }}
                className={`relative rounded-lg p-2 transition ${
                  notificationOpen
                    ? "bg-slate-800 text-amber-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {unreadCount} unread notification
                        {unreadCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      aria-label="Close notifications"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
                    <span className="text-xs font-medium text-slate-400">
                      Recent activity
                    </span>

                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-400 transition hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[390px] overflow-y-auto">
                    {notificationLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-slate-400">
                        <RefreshCw
                          size={22}
                          className="animate-spin"
                        />
                        <p className="text-sm">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notificationError ? (
                      <div className="px-5 py-8 text-center">
                        <AlertCircle
                          className="mx-auto mb-2 text-rose-400"
                          size={25}
                        />

                        <p className="text-sm text-rose-300">
                          {notificationError}
                        </p>

                        <button
                          type="button"
                          onClick={() => fetchNotifications(true)}
                          className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                        <div className="mb-3 rounded-full bg-slate-800 p-4 text-slate-500">
                          <Bell size={24} />
                        </div>

                        <p className="text-sm font-semibold text-white">
                          You're all caught up!
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          New activity notifications will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`border-b border-slate-800/80 px-4 py-4 transition hover:bg-slate-800/50 ${
                            !notification.isRead
                              ? "bg-amber-500/[0.04]"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 rounded-lg border p-2 ${
                                severityStyles[notification.severity] ||
                                severityStyles.INFO
                              }`}
                            >
                              <Bell size={15} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {notification.title}
                                </p>

                                {!notification.isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {notification.message}
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Clock size={11} />
                                  {getNotificationTime(
                                    notification.createdAt
                                  )}
                                </span>

                                {!notification.isRead && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMarkAsRead(notification._id)
                                    }
                                    className="text-[10px] font-semibold text-amber-400 hover:text-amber-300"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-800 px-4 py-3">
                    <p className="text-center text-[10px] text-slate-500">
                      DineOps · Live notification updates every 30 seconds
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
