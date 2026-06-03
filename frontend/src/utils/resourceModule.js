export const RESOURCE_TYPES = [
  { value: "LECTURE_HALL", label: "Lecture Hall", color: "#4f8ef7", className: "type-hall" },
  { value: "LAB", label: "Lab", color: "#7c5cfc", className: "type-lab" },
  { value: "MEETING_ROOM", label: "Meeting Room", color: "#2dd4a0", className: "type-meeting" },
  { value: "EQUIPMENT", label: "Equipment", color: "#f7a94f", className: "type-equipment" },
];

export const RESOURCE_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "#2dd4a0", className: "active" },
  { value: "OUT_OF_SERVICE", label: "Out of Service", color: "#f75f5f", className: "oos" },
  { value: "MAINTENANCE", label: "Maintenance", color: "#f7a94f", className: "maintenance" },
];

export const EMPTY_RESOURCE_FORM = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availFrom: "08:00",
  availUntil: "18:00",
  description: "",
};

export const RESOURCE_FORM_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  locationMin: 3,
  locationMax: 80,
  descriptionMax: 240,
  minAvailabilityMinutes: 30,
};

const RESOURCE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s#&(),./-]*$/;
const RESOURCE_LOCATION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s,#./()-]*$/;

const CAPACITY_RULES_BY_TYPE = {
  LECTURE_HALL: { min: 20, max: 500, label: "Lecture halls usually support 20 to 500 seats." },
  LAB: { min: 10, max: 120, label: "Labs usually support 10 to 120 users." },
  MEETING_ROOM: { min: 2, max: 50, label: "Meeting rooms usually support 2 to 50 seats." },
  EQUIPMENT: { min: 1, max: 20, label: "Equipment is usually tracked as 1 to 20 units." },
};

export const MOCK_RESOURCES = [];

export function normalizeResource(resource = {}) {
  return {
    id: resource.id ?? null,
    name: resource.name ?? "",
    type: resource.type ?? "",
    capacity: Number(resource.capacity ?? 0),
    location: resource.location ?? "",
    status: resource.status ?? "ACTIVE",
    availFrom: resource.availFrom ?? "08:00",
    availUntil: resource.availUntil ?? "18:00",
    description: resource.description ?? "",
  };
}

export function sanitizeResourceForm(form = EMPTY_RESOURCE_FORM) {
  return {
    ...EMPTY_RESOURCE_FORM,
    ...form,
    name: String(form.name ?? "").replace(/\s+/g, " ").trim(),
    type: String(form.type ?? "").trim(),
    capacity: String(form.capacity ?? "").trim(),
    location: String(form.location ?? "").replace(/\s+/g, " ").trim(),
    status: String(form.status ?? "ACTIVE").trim() || "ACTIVE",
    availFrom: String(form.availFrom ?? "08:00").trim() || "08:00",
    availUntil: String(form.availUntil ?? "18:00").trim() || "18:00",
    description: String(form.description ?? "").replace(/\s+/g, " ").trim(),
  };
}

export function getCapacityGuidance(type) {
  return CAPACITY_RULES_BY_TYPE[type]?.label ?? "Use a realistic positive capacity for this resource.";
}

function parseTimeValue(value) {
  const timeStr = String(value ?? "").trim();
  
  // Handle 12-hour format with AM/PM (e.g., "08:00:00 AM" or "01:00:00 PM")
  const ampmMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)$/.exec(timeStr);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[4].toUpperCase();
    
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    
    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
  
  // Handle 24-hour format (e.g., "08:00" or "18:00")
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return hours * 60 + minutes;
  }
  
  return null;
}

export function validateResourceForm(form, resources = [], editingId = null) {
  const normalized = sanitizeResourceForm(form);
  const errors = {};

  if (!normalized.name) {
    errors.name = "Resource name is required.";
  } else if (normalized.name.length < RESOURCE_FORM_LIMITS.nameMin) {
    errors.name = `Resource name must be at least ${RESOURCE_FORM_LIMITS.nameMin} characters.`;
  } else if (normalized.name.length > RESOURCE_FORM_LIMITS.nameMax) {
    errors.name = `Resource name must stay under ${RESOURCE_FORM_LIMITS.nameMax} characters.`;
  } else if (!RESOURCE_NAME_PATTERN.test(normalized.name)) {
    errors.name = "Use letters, numbers, spaces, and common room markers only.";
  }

  if (!normalized.type) {
    errors.type = "Select a resource type.";
  }

  if (!normalized.capacity) {
    errors.capacity = "Capacity is required.";
  } else {
    const parsedCapacity = Number(normalized.capacity);
    const isWholeNumber = Number.isInteger(parsedCapacity);
    const capacityRule = CAPACITY_RULES_BY_TYPE[normalized.type];

    if (!Number.isFinite(parsedCapacity) || !isWholeNumber) {
      errors.capacity = "Capacity must be a whole number.";
    } else if (parsedCapacity <= 0) {
      errors.capacity = "Capacity must be greater than zero.";
    } else if (capacityRule && parsedCapacity < capacityRule.min) {
      errors.capacity = `Capacity for ${typeLabel(normalized.type).toLowerCase()} should be at least ${capacityRule.min}.`;
    } else if (capacityRule && parsedCapacity > capacityRule.max) {
      errors.capacity = `Capacity for ${typeLabel(normalized.type).toLowerCase()} should not exceed ${capacityRule.max}.`;
    }
  }

  if (!normalized.location) {
    errors.location = "Location is required.";
  } else if (normalized.location.length < RESOURCE_FORM_LIMITS.locationMin) {
    errors.location = `Location must be at least ${RESOURCE_FORM_LIMITS.locationMin} characters.`;
  } else if (normalized.location.length > RESOURCE_FORM_LIMITS.locationMax) {
    errors.location = `Location must stay under ${RESOURCE_FORM_LIMITS.locationMax} characters.`;
  } else if (!RESOURCE_LOCATION_PATTERN.test(normalized.location)) {
    errors.location = "Use a realistic building or floor format such as Block A, Level 2.";
  }

  if (!normalized.status) {
    errors.status = "Select a resource status.";
  }

  const startMinutes = parseTimeValue(normalized.availFrom);
  const endMinutes = parseTimeValue(normalized.availUntil);

  if (!startMinutes && startMinutes !== 0) {
    errors.availFrom = "Choose a valid start time.";
  }

  if (!endMinutes && endMinutes !== 0) {
    errors.availUntil = "Choose a valid end time.";
  }

  if ((startMinutes || startMinutes === 0) && (endMinutes || endMinutes === 0)) {
    if (endMinutes <= startMinutes) {
      errors.availUntil = "End time must be later than start time.";
    } else if (endMinutes - startMinutes < RESOURCE_FORM_LIMITS.minAvailabilityMinutes) {
      errors.availUntil = `Availability window must be at least ${RESOURCE_FORM_LIMITS.minAvailabilityMinutes} minutes.`;
    }
  }

  if (normalized.description.length > RESOURCE_FORM_LIMITS.descriptionMax) {
    errors.description = `Description must stay under ${RESOURCE_FORM_LIMITS.descriptionMax} characters.`;
  }

  const duplicateResource = resources.find(
    (resource) =>
      resource.name.trim().toLowerCase() === normalized.name.toLowerCase() &&
      resource.location.trim().toLowerCase() === normalized.location.toLowerCase() &&
      resource.id !== editingId
  );

  if (duplicateResource) {
    errors.name = "A resource with the same name and location already exists.";
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function sortResources(resources) {
  return [...resources].sort((a, b) => {
    if ((a.id ?? 0) !== (b.id ?? 0)) {
      return (a.id ?? 0) - (b.id ?? 0);
    }
    return a.name.localeCompare(b.name);
  });
}

export function getNextResourceId(resources) {
  return resources.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export function typeLabel(value) {
  return RESOURCE_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function typeClass(value) {
  return RESOURCE_TYPES.find((item) => item.value === value)?.className ?? "";
}

export function statusLabel(value) {
  return RESOURCE_STATUSES.find((item) => item.value === value)?.label ?? value;
}

export function statusClass(value) {
  return RESOURCE_STATUSES.find((item) => item.value === value)?.className ?? "";
}

export function summarizeResources(resources) {
  return {
    total: resources.length,
    active: resources.filter((item) => item.status === "ACTIVE").length,
    outOfService: resources.filter((item) => item.status === "OUT_OF_SERVICE").length,
    maintenance: resources.filter((item) => item.status === "MAINTENANCE").length,
  };
}

export function buildTypeSeries(resources) {
  return RESOURCE_TYPES.map((item) => ({
    ...item,
    count: resources.filter((resource) => resource.type === item.value).length,
    capacity: resources
      .filter((resource) => resource.type === item.value)
      .reduce((sum, resource) => sum + Number(resource.capacity || 0), 0),
  }));
}

export function buildStatusSeries(resources) {
  return RESOURCE_STATUSES.map((item) => ({
    ...item,
    count: resources.filter((resource) => resource.status === item.value).length,
  }));
}

export function filterResources(resources, filters = {}) {
  const search = (filters.search ?? "").trim().toLowerCase();
  const type = filters.type ?? "";
  const status = filters.status ?? "";
  const capacity = filters.capacity ?? "";

  return resources.filter((resource) => {
    const matchesSearch =
      !search ||
      resource.name.toLowerCase().includes(search) ||
      resource.location.toLowerCase().includes(search);

    const matchesType = !type || resource.type === type;
    const matchesStatus = !status || resource.status === status;

    let matchesCapacity = true;
    if (capacity === "small") matchesCapacity = Number(resource.capacity) <= 20;
    if (capacity === "medium") matchesCapacity = Number(resource.capacity) >= 21 && Number(resource.capacity) <= 50;
    if (capacity === "large") matchesCapacity = Number(resource.capacity) >= 51;

    return matchesSearch && matchesType && matchesStatus && matchesCapacity;
  });
}

export function formatAvailability(resource) {
  return `${resource.availFrom || "--:--"}  -  ${resource.availUntil || "--:--"}`;
}

export function buildCsv(resources) {
  const rows = [
    ["Name", "Type", "Capacity", "Location", "Status", "Available From", "Available Until"],
    ...resources.map((resource) => [
      resource.name,
      typeLabel(resource.type),
      resource.capacity,
      resource.location,
      statusLabel(resource.status),
      resource.availFrom,
      resource.availUntil,
    ]),
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export function downloadCsv(resources, filename = "campus-resources.csv") {
  const csv = buildCsv(resources);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
