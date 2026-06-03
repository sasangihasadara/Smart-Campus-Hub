const ROLE_BASE_PATH = {
  ADMIN: "/admin",
  TECHNICIAN: "/technician",
  STUDENT: "/user",
  FACULTY: "/user",
  STAFF: "/user",
};

const USER_ROLES = ["STUDENT", "FACULTY", "STAFF"];

const ROLE_SECTIONS = {
  ADMIN: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", path: "dashboard", key: "dashboard", tone: "dashboard" },
        { label: "Resources", path: "resources", key: "resources", tone: "resources" },
        { label: "Available", path: "available", key: "available", tone: "available" },
        { label: "Reports", path: "reports", key: "reports", tone: "reports" },
      ],
    },
    {
      label: "Administration",
      items: [{ label: "Booking Management", path: "/admin/bookings", key: "admin", tone: "admin" }],
    },
  ],
  TECHNICIAN: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", path: "dashboard", key: "dashboard", tone: "dashboard" },
        { label: "Resources", path: "resources", key: "resources", tone: "resources" },
        { label: "Available", path: "available", key: "available", tone: "available" },
        { label: "Reports", path: "reports", key: "reports", tone: "reports" },
      ],
    },
  ],
  STUDENT: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", path: "dashboard", key: "dashboard", tone: "dashboard" },
        { label: "Resources", path: "resources", key: "resources", tone: "resources" },
        { label: "Available", path: "available", key: "available", tone: "available" },
      ],
    },
  ],
  FACULTY: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", path: "dashboard", key: "dashboard", tone: "dashboard" },
        { label: "Resources", path: "resources", key: "resources", tone: "resources" },
        { label: "Available", path: "available", key: "available", tone: "available" },
        { label: "Reports", path: "reports", key: "reports", tone: "reports" },
      ],
    },
  ],
  STAFF: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", path: "dashboard", key: "dashboard", tone: "dashboard" },
        { label: "Resources", path: "resources", key: "resources", tone: "resources" },
        { label: "Available", path: "available", key: "available", tone: "available" },
        { label: "Reports", path: "reports", key: "reports", tone: "reports" },
      ],
    },
  ],
};

const FALLBACK_SECTIONS = ROLE_SECTIONS.STUDENT;

export const getRoleBasePath = (role, pathname = "") => {
  if (ROLE_BASE_PATH[role]) {
    return ROLE_BASE_PATH[role];
  }

  if (pathname.startsWith("/admin")) {
    return "/admin";
  }

  if (pathname.startsWith("/technician")) {
    return "/technician";
  }

  return "/user";
};

export const getRoleSidebarSections = (role, pathname = "") => {
  const basePath = getRoleBasePath(role, pathname);
  const sections = ROLE_SECTIONS[role] || FALLBACK_SECTIONS;

  return sections.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      ...item,
      path: item.path.startsWith("/") ? item.path : `${basePath}/${item.path}`,
    })),
  }));
};

export const getRoleSearchItems = (role, pathname = "") => {
  const sections = getRoleSidebarSections(role, pathname);
  return sections.flatMap((section) => section.items);
};

export const isUserRole = (role) => USER_ROLES.includes(role);

