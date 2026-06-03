import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  LifeBuoy,
  MessageSquareText,
  Paperclip,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getResources } from "../../services/resourceService";
import {
  addTicketAttachment,
  addTicketComment,
  assignTicket,
  buildTicketAttachmentUrl,
  createTicket,
  deleteTicket,
  deleteTicketAttachment,
  deleteTicketComment,
  getTicketById,
  getTickets,
  updateTicketComment,
  updateTicketResolution,
  updateTicketStatus,
} from "../../services/ticketService";
import { formatSlaRemaining, getSlaStatus } from "../../utils/SlaHelper";
import "../../styles/tickets-page.css";

const categoryOptions = [
  "HARDWARE",
  "SOFTWARE",
  "NETWORK",
  "PROJECTOR",
  "ELECTRICAL",
  "FACILITY",
  "SECURITY",
  "OTHER",
];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const roleOptions = ["USER", "TECHNICIAN", "ADMIN"];

const emptyCreateForm = {
  resourceId: "",
  location: "",
  category: "HARDWARE",
  description: "",
  priority: "MEDIUM",
  preferredContactName: "",
  preferredContactEmail: "",
  preferredContactPhone: "",
  reporterName: "",
  reporterEmail: "",
};

const emptyViewer = {
  id: "USR-001",
  name: "Campus User",
  email: "user@smartcampus.local",
  role: "USER",
};

const emptyAssignment = {
  assignedTo: "",
  assignedToName: "",
  assignedToEmail: "",
};

const rolePageConfig = {
  USER: {
    description:
      "Create and track campus incidents with image evidence, threaded comments, and clear workflow updates.",
    eyebrow: "Operations Desk",
    pageTitle: "Incident Tickets",
    queueHint: "Your reported incidents",
    showCreatePanel: true,
    showRoleSwitcher: true,
  },
  TECHNICIAN: {
    description:
      "Work assigned issues, capture diagnostics, upload proof, and move tickets through the repair workflow.",
    eyebrow: "Technician Console",
    pageTitle: "Technician Tickets",
    queueHint: "Your assigned queue",
    showCreatePanel: false,
    showRoleSwitcher: true,
  },
  ADMIN: {
    description:
      "Oversee the full incident queue, assign technicians, handle rejections, and keep campus support operations moving.",
    eyebrow: "Admin Control",
    pageTitle: "Admin Tickets",
    queueHint: "Campus-wide queue",
    showCreatePanel: false,
    showRoleSwitcher: true,
  },
};

function prettyLabel(value) {
  return value?.replaceAll("_", " ") ?? "";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusClass(status) {
  return `ticket-badge ticket-badge--${String(status || "").toLowerCase()}`;
}

function priorityClass(priority) {
  return `ticket-pill ticket-pill--${String(priority || "").toLowerCase()}`;
}

function getViewerRole(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "TECHNICIAN" || normalized === "STAFF") return "TECHNICIAN";
  return "USER";
}

function getNextStatuses(status, role) {
  const viewerRole = getViewerRole(role);
  
  if (status === "OPEN") {
    // Admin can move to IN_PROGRESS or REJECTED
    // Technician can move to IN_PROGRESS
    if (viewerRole === "ADMIN") return ["IN_PROGRESS", "REJECTED"];
    if (viewerRole === "TECHNICIAN") return ["IN_PROGRESS"];
  }
  
  if (status === "IN_PROGRESS") {
    // Admin can move to RESOLVED or REJECTED
    // Technician can move to RESOLVED
    if (viewerRole === "ADMIN") return ["RESOLVED", "REJECTED"];
    if (viewerRole === "TECHNICIAN") return ["RESOLVED"];
  }
  
  if (status === "RESOLVED") {
    // ONLY Admin can move to CLOSED
    if (viewerRole === "ADMIN") return ["CLOSED"];
  }
  
  return [];
}

function buildFilterParams(filters, viewer) {
  const params = {};

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.category) params.category = filters.category;

  const role = getViewerRole(viewer.role);
  if (role === "USER") {
    params.reporterEmail = viewer.email.trim().toLowerCase();
  }
  if (role === "TECHNICIAN") {
    params.assignedToEmail = viewer.email.trim().toLowerCase();
  }

  return params;
}

function getSlaTone(priority) {
  switch (priority) {
    case "LOW":
      return { background: "#dcfce7", color: "#166534", border: "#86efac" };
    case "MEDIUM":
      return { background: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    case "HIGH":
      return { background: "#ffedd5", color: "#c2410c", border: "#fdba74" };
    case "CRITICAL":
      return { background: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };
    default:
      return { background: "#e5e7eb", color: "#374151", border: "#d1d5db" };
  }
}

function formatDuration(value, now = Date.now()) {
  if (!value) return "0m";
  const diffMs = Math.max(now - new Date(value).getTime(), 0);
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`ticket-stat-card ticket-stat-card--${accent}`}>
      <div className="ticket-stat-card__icon">{icon}</div>
      <div>
        <div className="ticket-stat-card__label">{label}</div>
        <div className="ticket-stat-card__value">{value}</div>
      </div>
    </div>
  );
}

function PanelTitle({ icon, eyebrow, title, action }) {
  return (
    <div className="ticket-panel-title">
      <div className="ticket-panel-title__main">
        <div className="ticket-panel-title__icon">{icon}</div>
        <div>
          {eyebrow ? <div className="ticket-panel-title__eyebrow">{eyebrow}</div> : null}
          <h2>{title}</h2>
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

function SlaMetricCard({ label, priority, createdAt, updatedAt, status, comments, type }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const sla = getSlaStatus(priority, createdAt, updatedAt, status, comments);
  const metric = sla[type];
  const isOverdue = metric.remaining < 0 && metric.met === null;
  const isMet = metric.met === true;
  const isMissed = metric.met === false;

  let accentColor = "#64748b"; // default
  if (isOverdue || isMissed) accentColor = "#ef4444";
  else if (isMet) accentColor = "#10b981";
  else if (metric.remaining < 3600000) accentColor = "#f59e0b"; // 1h warning

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        border: `1px solid ${accentColor}33`,
        borderRadius: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: "0.8rem 1rem",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
        {isMet && <CheckCircle2 size={16} color="#10b981" />}
        {(isMissed || isOverdue) && <AlertCircle size={16} color="#ef4444" />}
      </div>
      <div style={{ alignItems: "baseline", display: "flex", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>
          {metric.met === null ? formatSlaRemaining(metric.remaining) : (isMet ? "Goal Met" : "Goal Missed")}
        </span>
      </div>
      <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>
        Deadline: {metric.deadline.toLocaleString()}
      </div>
    </div>
  );
}

function SlaBadge({ priority, createdAt, updatedAt, status, comments }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const sla = getSlaStatus(priority, createdAt, updatedAt, status, comments);
  const tone = getSlaTone(priority);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <span
        style={{
          alignItems: "center",
          background: tone.background,
          border: `1px solid ${tone.border}`,
          borderRadius: "999px",
          color: tone.color,
          display: "inline-flex",
          fontSize: "0.7rem",
          fontWeight: 700,
          gap: "0.35rem",
          padding: "0.25rem 0.6rem",
        }}
      >
        <Clock3 size={12} />
        {sla.response.label}: {sla.response.met === null ? formatSlaRemaining(sla.response.remaining) : (sla.response.met ? "Met" : "Missed")}
      </span>
      <span
        style={{
          alignItems: "center",
          background: tone.background,
          border: `1px solid ${tone.border}`,
          borderRadius: "999px",
          color: tone.color,
          display: "inline-flex",
          fontSize: "0.7rem",
          fontWeight: 700,
          gap: "0.35rem",
          padding: "0.25rem 0.6rem",
        }}
      >
        <Clock3 size={12} />
        {sla.resolution.label}: {sla.resolution.met === null ? formatSlaRemaining(sla.resolution.remaining) : (sla.resolution.met ? "Met" : "Missed")}
      </span>
    </div>
  );
}

export default function TicketListPage({ forcedRole = null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initialRole = forcedRole ? getViewerRole(forcedRole) : getViewerRole(user?.role || emptyViewer.role);
  const pageConfig = rolePageConfig[initialRole] || rolePageConfig.USER;
  const showTicketBrowser = !pageConfig.showCreatePanel;
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [viewer, setViewer] = useState(() => ({
    ...emptyViewer,
    id: user?.id || emptyViewer.id,
    name: user?.name || emptyViewer.name,
    email: user?.email || emptyViewer.email,
    role: initialRole,
  }));
  const [roleSelection, setRoleSelection] = useState(initialRole);
  const [rolePassword, setRolePassword] = useState("");
  const [roleError, setRoleError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", category: "" });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [newAttachment, setNewAttachment] = useState(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    rejectionReason: "",
    resolutionNotes: "",
  });
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const isAdmin = getViewerRole(viewer.role) === "ADMIN";
  const isTechnician = getViewerRole(viewer.role) === "TECHNICIAN";

  const chosenResource = useMemo(
    () => resources.find((resource) => String(resource.id) === String(createForm.resourceId)) || null,
    [createForm.resourceId, resources],
  );

  useEffect(() => {
    if (!forcedRole) return;

    const lockedRole = getViewerRole(forcedRole);
    setViewer((current) => ({ ...current, role: lockedRole }));
    setRoleSelection(lockedRole);
    setShowPasswordForm(false);
    setRolePassword("");
    setRoleError("");
  }, [forcedRole]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
    }),
    [tickets],
  );

  const statusChoices = useMemo(
    () => getNextStatuses(selectedTicket?.status, viewer.role),
    [selectedTicket?.status, viewer.role],
  );

  const loadResources = useCallback(async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to load resources.");
    }
  }, []);

  const loadTickets = useCallback(async (keepId = selectedTicketId) => {
    try {
      setListLoading(true);
      const data = await getTickets(buildFilterParams(filters, viewer));
      setTickets(data);

      if (!data.length) {
        setSelectedTicketId(null);
        return;
      }

      const targetId = data.some((ticket) => ticket.id === keepId) ? keepId : data[0].id;
      setSelectedTicketId(targetId);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to load tickets.");
    } finally {
      setListLoading(false);
    }
  }, [filters, selectedTicketId, viewer]);

  const loadTicket = useCallback(async (ticketId) => {
    try {
      setDetailLoading(true);
      const ticket = await getTicketById(ticketId);
      setSelectedTicket(ticket);
      setAssignment({
        assignedTo: ticket.assignedTo || "",
        assignedToName: ticket.assignedToName || ticket.assignedStaffName || "",
        assignedToEmail: ticket.assignedToEmail || ticket.assignedStaffEmail || "",
      });
      setResolutionNotes(ticket.resolutionNotes || "");
      const choices = getNextStatuses(ticket.status, viewer.role);
      setStatusUpdate({
        status: choices[0] || "",
        rejectionReason: "",
        resolutionNotes: ticket.status === "IN_PROGRESS" ? ticket.resolutionNotes || "" : "",
      });
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to load ticket details.");
    } finally {
      setDetailLoading(false);
    }
  }, [viewer.role]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }
    void loadTicket(selectedTicketId);
  }, [loadTicket, selectedTicketId]);

  function updateViewer(field, value) {
    setViewer((current) => {
      const next = { ...current, [field]: field === "role" ? getViewerRole(value) : value };
      if (field === "name" && !createForm.reporterName) {
        setCreateForm((form) => ({ ...form, reporterName: value, preferredContactName: form.preferredContactName || value }));
      }
      if (field === "email" && !createForm.reporterEmail) {
        setCreateForm((form) => ({
          ...form,
          reporterEmail: value,
          preferredContactEmail: form.preferredContactEmail || value,
        }));
      }
      return next;
    });
    if (field === "role") {
      setRoleSelection(getViewerRole(value));
    }
  }

  // Handle role selection with password prompt
  function handleRoleChange(e) {
    const selected = e.target.value;
    setRoleSelection(selected);
    setRolePassword("");
    setRoleError("");
    if (selected === "TECHNICIAN" || selected === "ADMIN") {
      // Show password input
      setShowPasswordForm(true);
      // Do not update viewer.role yet
    } else {
      setShowPasswordForm(false);
      updateViewer("role", selected);
    }
  }

  function handleRolePasswordSubmit(e) {
    e.preventDefault();

    if (
      (roleSelection === "ADMIN" && rolePassword === "admin") ||
      (roleSelection === "TECHNICIAN" && rolePassword === "tech")
    ) {
      setRoleError("");
      setShowPasswordForm(false);

      const targetRoute = roleSelection === "ADMIN" ? "/admin-tickets" : "/technician-tickets";
      updateViewer("role", roleSelection);
      navigate(targetRoute);
    } else {
      setRoleError("Incorrect password");
    }
  }

  function handleSignOut() {
    logout();
    navigate("/tickets");
  }

  function updateCreateField(field, value) {
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  async function createTicketItem() {
    if (attachmentFiles.length > 3) {
      setFeedback("Please select up to 3 image attachments.");
      return;
    }

    if (!createForm.description || createForm.description.length < 10) {
      setFeedback("Description must be at least 10 characters long.");
      return;
    }

    if (!createForm.resourceId && !createForm.location.trim()) {
      setFeedback("Please select a resource or provide a location.");
      return;
    }

    if (!createForm.reporterEmail && !viewer.email) {
      setFeedback("Reporter email is required. Please fill your profile or the form.");
      return;
    }

    const formData = new FormData();
    // Ensure all required fields are present
    const payload = {
      ...createForm,
      reporterName: createForm.reporterName || viewer.name || "Anonymous",
      reporterEmail: createForm.reporterEmail || viewer.email || "anonymous@smartcampus.local",
      preferredContactName: createForm.preferredContactName || createForm.reporterName || viewer.name || "Anonymous",
      preferredContactEmail: createForm.preferredContactEmail || createForm.reporterEmail || viewer.email || "anonymous@smartcampus.local",
    };

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    attachmentFiles.forEach((file) => formData.append("attachments", file));

    try {
      setBusy(true);
      console.log("Submitting ticket with payload:", payload);
      const created = await createTicket(formData);
      console.log("Ticket created successfully:", created);
      setFeedback(`Ticket #${created.id} created successfully.`);
      setAttachmentFiles([]);
      setCreateForm({
        ...emptyCreateForm,
        reporterName: viewer.name,
        reporterEmail: viewer.email,
        preferredContactName: viewer.name,
        preferredContactEmail: viewer.email,
      });
      // Important: refresh list and select the new ticket
      await loadTickets(created.id);
      setSelectedTicketId(created.id);
      // Force load the specific ticket detail
      void loadTicket(created.id);
    } catch (error) {
      console.error("Ticket creation failed:", error);
      const data = error.response?.data;
      if (data?.message === "Validation failed" && data?.data) {
        const errorList = Object.entries(data.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        setFeedback(`Validation failed - ${errorList}`);
      } else {
        setFeedback(data?.message || data?.error?.message || error.message || "Unable to create ticket.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAssignment() {
    if (!selectedTicket) return;

    try {
      setBusy(true);
      await assignTicket(selectedTicket.id, {
        ...assignment,
        actorRole: viewer.role,
      });
      setFeedback("Technician assigned successfully.");
      await loadTickets(selectedTicket.id);
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to assign technician.");
    } finally {
      setBusy(false);
    }
  }

  async function submitStatusUpdate() {
    if (!selectedTicket || !statusUpdate.status) return;

    if (statusUpdate.status === "REJECTED" && !statusUpdate.rejectionReason.trim()) {
      setFeedback("Please provide a rejection reason.");
      return;
    }

    if (statusUpdate.status === "RESOLVED" && !statusUpdate.resolutionNotes.trim()) {
      setFeedback("Please provide resolution notes before resolving.");
      return;
    }

    try {
      setBusy(true);
      await updateTicketStatus(selectedTicket.id, {
        status: statusUpdate.status,
        rejectionReason: statusUpdate.rejectionReason,
        resolutionNotes: statusUpdate.resolutionNotes,
        actorEmail: viewer.email,
        actorRole: viewer.role,
      });
      setFeedback("Ticket status updated.");
      await loadTickets(selectedTicket.id);
      await loadTicket(selectedTicket.id);
    } catch (error) {
      const data = error.response?.data;
      if (data?.message === "Validation failed" && data?.data) {
        const errorList = Object.entries(data.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        setFeedback(`Validation failed - ${errorList}`);
      } else {
        setFeedback(data?.message || error.message || "Unable to update ticket status.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitResolution() {
    if (!selectedTicket) return;

    const formData = new FormData();
    formData.append("resolutionNotes", resolutionNotes);
    formData.append("actorEmail", viewer.email);
    formData.append("actorRole", viewer.role);

    try {
      setBusy(true);
      await updateTicketResolution(selectedTicket.id, formData);
      setFeedback("Resolution notes saved.");
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to save resolution notes.");
    } finally {
      setBusy(false);
    }
  }

  async function submitComment() {
    if (!selectedTicket || !commentMessage.trim()) return;

    try {
      setBusy(true);
      if (editingCommentId) {
        const formData = new FormData();
        formData.append("actorEmail", viewer.email);
        formData.append("actorRole", viewer.role);
        formData.append("body", commentMessage);
        await updateTicketComment(selectedTicket.id, editingCommentId, formData);
        setFeedback("Comment updated.");
      } else {
        await addTicketComment(selectedTicket.id, {
          authorName: viewer.name,
          authorEmail: viewer.email,
          authorRole: viewer.role,
          message: commentMessage,
        });
        setFeedback("Comment added.");
      }

      setCommentMessage("");
      setEditingCommentId(null);
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to save comment.");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId) {
    if (!selectedTicket) return;

    try {
      setBusy(true);
      await deleteTicketComment(selectedTicket.id, commentId, {
        actorEmail: viewer.email,
        actorRole: viewer.role,
      });
      setFeedback("Comment deleted.");
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to delete comment.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAttachment() {
    if (!selectedTicket || !newAttachment) return;

    try {
      setBusy(true);
      const formData = new FormData();
      formData.append("attachment", newAttachment);
      await addTicketAttachment(selectedTicket.id, formData);
      setNewAttachment(null);
      setFeedback("Attachment uploaded.");
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to upload attachment.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAttachment(attachmentId) {
    if (!selectedTicket) return;

    try {
      setBusy(true);
      await deleteTicketAttachment(selectedTicket.id, attachmentId);
      setFeedback("Attachment deleted.");
      await loadTicket(selectedTicket.id);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to delete attachment.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelectedTicket() {
    if (!selectedTicket) return;
    const confirmed = window.confirm(`Delete ticket #${selectedTicket.id}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setBusy(true);
      await deleteTicket(selectedTicket.id, viewer.role);
      setFeedback(`Ticket #${selectedTicket.id} deleted.`);
      await loadTickets();
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || "Unable to delete ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tickets-page">
      <div className="tickets-page__backdrop" />

      <header className="tickets-hero">
        <div className="tickets-hero__copy">
          <div className="tickets-hero__eyebrow">{pageConfig.eyebrow}</div>
          <h1>{pageConfig.pageTitle}</h1>
          <p>{pageConfig.description}</p>
        </div>

        <div className="tickets-hero__stats">
          <StatCard icon={<ClipboardList size={18} />} label="Visible Tickets" value={stats.total} accent="blue" />
          <StatCard icon={<AlertTriangle size={18} />} label="Open" value={stats.open} accent="amber" />
          <StatCard icon={<Wrench size={18} />} label="In Progress" value={stats.inProgress} accent="violet" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Resolved" value={stats.resolved} accent="green" />
        </div>
      </header>

      {feedback ? (
        <div className="tickets-feedback">
          <AlertCircle size={18} />
          <span>{feedback}</span>
        </div>
      ) : null}

      <div className="tickets-grid tickets-grid--top">
        {pageConfig.showRoleSwitcher ? (
          <section className="ticket-panel">
            <PanelTitle icon={<UserCircle2 size={18} />} eyebrow="Session Context" title="Acting User" />

            <div className="ticket-form-grid ticket-form-grid--single">
              <label className="ticket-field">
                <span>User Id</span>
                <input value={viewer.id} onChange={(event) => updateViewer("id", event.target.value)} />
              </label>

              <label className="ticket-field">
                <span>Name</span>
                <input value={viewer.name} onChange={(event) => updateViewer("name", event.target.value)} />
              </label>

              <label className="ticket-field">
                <span>Email</span>
                <input value={viewer.email} onChange={(event) => updateViewer("email", event.target.value)} />
              </label>

              <label className="ticket-field">
                <span>Role</span>
                <select value={roleSelection} onChange={handleRoleChange}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {showPasswordForm && (
                  <form onSubmit={handleRolePasswordSubmit} style={{ marginTop: 8 }}>
                    <input
                      type="password"
                      placeholder={`Enter ${roleSelection.toLowerCase()} password`}
                      value={rolePassword}
                      onChange={(event) => setRolePassword(event.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    <button type="submit">Confirm</button>
                    {roleError ? <div style={{ color: "red", marginTop: 4 }}>{roleError}</div> : null}
                  </form>
                )}
              </label>
            </div>
          </section>
        ) : (
          <section className="ticket-panel">
            <PanelTitle
              icon={<UserCircle2 size={18} />}
              eyebrow="Role Workspace"
              title="Active Session"
              action={
                <button className="ticket-button ticket-button--danger" type="button" onClick={handleSignOut}>
                  Sign Out
                </button>
              }
            />
            <div className="ticket-form-grid ticket-form-grid--single">
              <label className="ticket-field">
                <span>User Id</span>
                <input value={viewer.id} onChange={(event) => updateViewer("id", event.target.value)} />
              </label>
              <label className="ticket-field">
                <span>Name</span>
                <input value={viewer.name} onChange={(event) => updateViewer("name", event.target.value)} />
              </label>
              <label className="ticket-field">
                <span>Email</span>
                <input value={viewer.email} onChange={(event) => updateViewer("email", event.target.value)} />
              </label>
              <label className="ticket-field">
                <span>Role</span>
                <input value={viewer.role} readOnly />
              </label>
            </div>
          </section>
        )}

        {pageConfig.showCreatePanel ? (
          <section className="ticket-panel">
            <PanelTitle
              icon={<PlusCircle size={18} />}
              eyebrow="New Incident"
              title="Create Ticket"
              action={
                <button
                  className="ticket-button ticket-button--ghost"
                  type="button"
                  style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                  onClick={() => {
                    setCreateForm((f) => ({
                      ...f,
                      reporterName: viewer.name,
                      reporterEmail: viewer.email,
                      preferredContactName: viewer.name,
                      preferredContactEmail: viewer.email,
                    }));
                  }}
                >
                  Fill from Profile
                </button>
              }
            />

            <div className="ticket-panel__intro">
              <span className="ticket-panel__pill">Enhanced Ticket Builder</span>
              <p className="ticket-panel__subcopy">
                Report issues faster with guided fields, resource-aware location auto-fill, and optional image proof.
              </p>
            </div>

            {chosenResource ? (
              <div className="ticket-card ticket-card--summary">
                <div className="ticket-card__heading">Selected Resource</div>
                <div className="ticket-card__grid">
                  <div><strong>{chosenResource.name}</strong></div>
                  <div>{chosenResource.location}</div>
                  <div>{prettyLabel(chosenResource.type)}</div>
                  <div>{prettyLabel(chosenResource.status)}</div>
                </div>
              </div>
            ) : (
              <div className="ticket-panel__hint">
                <strong>Tip:</strong> Select a resource to prefill location. If no resource is available, just type the room or area.
              </div>
            )}

            <div className="ticket-form-grid">
              <label className="ticket-field">
                <span>Resource</span>
                <select
                  value={createForm.resourceId}
                  onChange={(event) => {
                    const resId = event.target.value;
                    updateCreateField("resourceId", resId);
                    const selectedRes = resources.find((r) => String(r.id) === String(resId));
                    if (selectedRes) {
                      setCreateForm((f) => ({
                        ...f,
                        location: selectedRes.location || f.location,
                      }));
                    }
                  }}
                >
                  <option value="">Select resource</option>
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.location})
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Location</span>
                <input
                  value={createForm.location}
                  onChange={(event) => updateCreateField("location", event.target.value)}
                  placeholder="Building / Room"
                />
              </label>

              <label className="ticket-field">
                <span>Category</span>
                <select value={createForm.category} onChange={(event) => updateCreateField("category", event.target.value)}>
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {prettyLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Priority</span>
                <select value={createForm.priority} onChange={(event) => updateCreateField("priority", event.target.value)}>
                  {priorityOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field ticket-field--full">
                <span>Description</span>
                <textarea
                  value={createForm.description}
                  onChange={(event) => updateCreateField("description", event.target.value)}
                  placeholder="Describe the issue, its impact, and anything already tried."
                />
              </label>

              <label className="ticket-field">
                <span>Preferred Contact Name</span>
                <input
                  value={createForm.preferredContactName}
                  onChange={(event) => updateCreateField("preferredContactName", event.target.value)}
                  placeholder={viewer.name}
                />
              </label>

              <label className="ticket-field">
                <span>Preferred Contact Email</span>
                <input
                  value={createForm.preferredContactEmail}
                  onChange={(event) => updateCreateField("preferredContactEmail", event.target.value)}
                  placeholder={viewer.email}
                />
              </label>

              <label className="ticket-field">
                <span>Preferred Contact Phone</span>
                <input
                  value={createForm.preferredContactPhone}
                  onChange={(event) => updateCreateField("preferredContactPhone", event.target.value)}
                />
              </label>

              <label className="ticket-field">
                <span>Reporter Name</span>
                <input
                  value={createForm.reporterName}
                  onChange={(event) => updateCreateField("reporterName", event.target.value)}
                  placeholder={viewer.name}
                />
              </label>

              <label className="ticket-field">
                <span>Reporter Email</span>
                <input
                  value={createForm.reporterEmail}
                  onChange={(event) => updateCreateField("reporterEmail", event.target.value)}
                  placeholder={viewer.email}
                />
              </label>

              <label className="ticket-field ticket-field--full ticket-upload">
                <span>Attachments</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []).slice(0, 3))}
                />
                {attachmentFiles.length ? (
                  <div className="ticket-upload__list">
                    {attachmentFiles.map((file) => (
                      <span key={`${file.name}-${file.size}`} className="ticket-upload__chip">
                        {file.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </label>
            </div>

            <button
              className="ticket-button ticket-button--primary"
              type="button"
              onClick={createTicketItem}
              disabled={busy}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {busy ? "Processing..." : "Create Incident Ticket"}
            </button>
          </section>
        ) : null}
      </div>

      {showTicketBrowser ? <div className="tickets-grid tickets-grid--main">
        <aside className="ticket-panel ticket-panel--queue">
          <PanelTitle
            icon={<Filter size={18} />}
            eyebrow="Browse"
            title="Ticket Queue"
            action={
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className="ticket-hint">
                  {isAdmin ? "All" : isTechnician ? "Assigned" : "Yours"}
                </span>
                <button
                  className="ticket-button ticket-button--ghost"
                  style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                  onClick={() => loadTickets()}
                  disabled={listLoading}
                >
                  Refresh
                </button>
              </div>
            }
          />

          <div className="ticket-filter-stack">
            <label className="ticket-search">
              <Search size={16} />
              <input
                placeholder="Search description, location, reporter, or assignee"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </label>

            <label className="ticket-field">
              <span>Status Filter</span>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {prettyLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="ticket-field">
              <span>Priority Filter</span>
              <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
                <option value="">All priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="ticket-field">
              <span>Category Filter</span>
              <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {prettyLabel(category)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ticket-queue">
            {listLoading ? (
              <div className="ticket-empty">
                <Clock3 size={18} />
                <span>Loading tickets...</span>
              </div>
            ) : tickets.length ? (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  className={`ticket-queue-item ${selectedTicketId === ticket.id ? "is-active" : ""}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="ticket-queue-item__top">
                    <strong>#{ticket.id}</strong>
                    <span className={statusClass(ticket.status)}>{prettyLabel(ticket.status)}</span>
                  </div>

                  <div className="ticket-queue-item__title">{prettyLabel(ticket.category)}</div>
                  <div className="ticket-queue-item__meta">{ticket.location}</div>

                  <div className="ticket-queue-item__footer">
                    <span className={priorityClass(ticket.priority)}>{ticket.priority}</span>
                    <span>{ticket.assignedToName || ticket.reporterName || "Unknown"}</span>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <SlaBadge
                      priority={ticket.priority}
                      createdAt={ticket.createdAt}
                      updatedAt={ticket.updatedAt}
                      status={ticket.status}
                      comments={ticket.comments || []}
                    />
                  </div>
                </button>
              ))
            ) : (
              <div className="ticket-empty">
                <LifeBuoy size={18} />
                <span>No tickets match the current role and filters.</span>
              </div>
            )}
          </div>
        </aside>

        <section className="ticket-panel ticket-panel--details">
          {selectedTicket ? (
            <div className="ticket-detail">
              <div className="ticket-detail__header">
                <div>
                  <div className="ticket-panel-title__eyebrow">Selected Ticket</div>
                  <h2>Ticket #{selectedTicket.id}</h2>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="ticket-detail__badges">
                  <span className={statusClass(selectedTicket.status)}>{prettyLabel(selectedTicket.status)}</span>
                  <span className={priorityClass(selectedTicket.priority)}>{selectedTicket.priority}</span>
                  <SlaBadge
                    priority={selectedTicket.priority}
                    createdAt={selectedTicket.createdAt}
                    updatedAt={selectedTicket.updatedAt}
                    status={selectedTicket.status}
                    comments={selectedTicket.comments || []}
                  />
                </div>
              </div>

              <div className="ticket-info-grid">
                <div className="ticket-info-card">
                  <span>Reporter</span>
                  <strong>{selectedTicket.reporterName}</strong>
                  <small>{selectedTicket.reporterEmail}</small>
                </div>
                <div className="ticket-info-card">
                  <span>Location</span>
                  <strong>{selectedTicket.location}</strong>
                  <small>{selectedTicket.resourceName || "No linked resource"}</small>
                </div>
                <div className="ticket-info-card">
                  <span>Assigned Technician</span>
                  <strong>{selectedTicket.assignedToName || "Unassigned"}</strong>
                  <small>{selectedTicket.assignedToEmail || "No technician assigned yet"}</small>
                </div>
                <div className="ticket-info-card">
                  <span>Timeline</span>
                  <strong>{formatDate(selectedTicket.createdAt)}</strong>
                  <small>Updated {formatDate(selectedTicket.updatedAt)}</small>
                </div>
              </div>

              <div className="ticket-detail-grid">
                <div className="ticket-detail-section">
                  <PanelTitle icon={<Clock3 size={18} />} eyebrow="SLA Status" title="Response & Resolution" />
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <SlaMetricCard
                      label="Initial Response"
                      priority={selectedTicket.priority}
                      createdAt={selectedTicket.createdAt}
                      updatedAt={selectedTicket.updatedAt}
                      status={selectedTicket.status}
                      comments={selectedTicket.comments}
                      type="response"
                    />
                    <SlaMetricCard
                      label="Ticket Resolution"
                      priority={selectedTicket.priority}
                      createdAt={selectedTicket.createdAt}
                      updatedAt={selectedTicket.updatedAt}
                      status={selectedTicket.status}
                      comments={selectedTicket.comments}
                      type="resolution"
                    />
                  </div>
                </div>

                {(isAdmin || isTechnician) && (
                  <div className="ticket-detail-section">
                    <PanelTitle icon={<AlertTriangle size={18} />} eyebrow="Workflow" title="Update Status" />
                    <div className="ticket-form-grid ticket-form-grid--single">
                      <label className="ticket-field">
                        <span>Next Status</span>
                        <select
                          value={statusUpdate.status}
                          onChange={(event) => setStatusUpdate((current) => ({ ...current, status: event.target.value }))}
                          disabled={!statusChoices.length}
                        >
                          <option value="">No valid transition</option>
                          {statusChoices.map((status) => (
                            <option key={status} value={status}>
                              {prettyLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {statusUpdate.status === "REJECTED" && isAdmin && (
                        <label className="ticket-field">
                          <span>Rejection Reason</span>
                          <textarea
                            value={statusUpdate.rejectionReason}
                            onChange={(event) =>
                              setStatusUpdate((current) => ({ ...current, rejectionReason: event.target.value }))
                            }
                            placeholder="Why this ticket is being rejected"
                          />
                        </label>
                      )}

                      {statusUpdate.status === "RESOLVED" && (
                        <label className="ticket-field">
                          <span>Resolution Notes</span>
                          <textarea
                            value={statusUpdate.resolutionNotes}
                            onChange={(event) =>
                              setStatusUpdate((current) => ({ ...current, resolutionNotes: event.target.value }))
                            }
                            placeholder="Explain how the issue was fixed"
                          />
                        </label>
                      )}
                    </div>

                    <button
                      className="ticket-button ticket-button--ghost"
                      type="button"
                      onClick={submitStatusUpdate}
                      disabled={busy || !statusUpdate.status}
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="ticket-detail-section">
                  <PanelTitle
                    icon={<ShieldCheck size={18} />}
                    eyebrow="Admin Action"
                    title="Assign Technician"
                    action={
                      <button
                        className="ticket-button ticket-button--ghost"
                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                        onClick={() => {
                          setAssignment({
                            assignedTo: viewer.id,
                            assignedToName: viewer.name,
                            assignedToEmail: viewer.email,
                          });
                        }}
                      >
                        Self-Assign
                      </button>
                    }
                  />
                  <div className="ticket-form-grid">
                    <label className="ticket-field">
                      <span>Technician Id</span>
                      <input
                        value={assignment.assignedTo}
                        onChange={(event) => setAssignment((current) => ({ ...current, assignedTo: event.target.value }))}
                        placeholder="TECH-001"
                      />
                    </label>
                    <label className="ticket-field">
                      <span>Technician Name</span>
                      <input
                        value={assignment.assignedToName}
                        onChange={(event) => setAssignment((current) => ({ ...current, assignedToName: event.target.value }))}
                      />
                    </label>
                    <label className="ticket-field ticket-field--full">
                      <span>Technician Email</span>
                      <input
                        value={assignment.assignedToEmail}
                        onChange={(event) => setAssignment((current) => ({ ...current, assignedToEmail: event.target.value }))}
                      />
                    </label>
                  </div>
                  <button
                    className="ticket-button ticket-button--ghost"
                    style={{ marginTop: "1rem" }}
                    type="button"
                    onClick={submitAssignment}
                    disabled={busy}
                  >
                    Save Assignment
                  </button>
                </div>
              )}

              <div className="ticket-detail-grid">
                {(isAdmin || isTechnician) && (
                  <div className="ticket-detail-section">
                    <PanelTitle icon={<Wrench size={18} />} eyebrow="Closeout" title="Resolution Notes" />
                    <label className="ticket-field">
                      <span>Resolution Summary</span>
                      <textarea
                        value={resolutionNotes}
                        onChange={(event) => setResolutionNotes(event.target.value)}
                        placeholder="Summary of diagnostics, repair steps, and final outcome"
                      />
                    </label>
                    <button className="ticket-button ticket-button--ghost" type="button" onClick={submitResolution} disabled={busy}>
                      Save Resolution
                    </button>
                  </div>
                )}

                <div className="ticket-detail-section">
                  <PanelTitle icon={<Paperclip size={18} />} eyebrow="Evidence" title="Attachments" />

                  <div
                    style={{
                      display: "grid",
                      gap: "0.75rem",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    }}
                  >
                    {(selectedTicket.attachments || []).length ? (
                      selectedTicket.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          style={{
                            background: "rgba(255,255,255,0.78)",
                            border: "1px solid rgba(15,23,42,0.08)",
                            borderRadius: "1rem",
                            overflow: "hidden",
                            padding: "0.75rem",
                          }}
                        >
                          <img
                            src={buildTicketAttachmentUrl(attachment)}
                            alt={attachment.originalFileName}
                            style={{ aspectRatio: "4 / 3", borderRadius: "0.75rem", objectFit: "cover", width: "100%" }}
                          />
                          <div style={{ marginTop: "0.65rem" }}>
                            <strong style={{ display: "block" }}>{attachment.originalFileName}</strong>
                            <small>{attachment.contentType}</small>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <a className="ticket-button ticket-button--ghost" href={buildTicketAttachmentUrl(attachment)} target="_blank" rel="noreferrer">
                              View
                            </a>
                            <button className="ticket-button ticket-button--danger" type="button" onClick={() => removeAttachment(attachment.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="ticket-empty ticket-empty--soft">No attachments uploaded yet.</div>
                    )}
                  </div>

                  <div className="ticket-upload ticket-upload--compact" style={{ marginTop: "1rem" }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => setNewAttachment(event.target.files?.[0] || null)}
                    />
                  </div>

                  <button className="ticket-button ticket-button--ghost" type="button" onClick={uploadAttachment} disabled={busy || !newAttachment}>
                    Upload Attachment
                  </button>
                </div>
              </div>

              {selectedTicket.rejectionReason ? (
                <div className="ticket-detail-section">
                  <PanelTitle icon={<AlertTriangle size={18} />} eyebrow="Rejected" title="Rejection Reason" />
                  <p>{selectedTicket.rejectionReason}</p>
                </div>
              ) : null}

              <div className="ticket-detail-section ticket-detail-section--comments">
                <PanelTitle icon={<MessageSquareText size={18} />} eyebrow="Collaboration" title="Comments" />

                <div className="ticket-comments">
                  {(selectedTicket.comments || []).length ? (
                    selectedTicket.comments.map((comment) => {
                      const canEdit =
                        comment.authorEmail?.toLowerCase() === viewer.email.toLowerCase() || isAdmin;

                      return (
                        <article
                          key={comment.id}
                          className="ticket-comment"
                          style={{
                            borderLeft: `4px solid ${canEdit ? "#2563eb" : "#cbd5e1"}`,
                            borderRadius: "1rem",
                            padding: "1rem",
                          }}
                        >
                          <div className="ticket-comment__header">
                            <div>
                              <strong>{comment.authorName}</strong>
                              <small>
                                {comment.authorEmail} | {prettyLabel(comment.authorRole)} | {formatDate(comment.createdAt)}
                              </small>
                            </div>

                            {canEdit ? (
                              <div className="ticket-comment__actions">
                                <button
                                  className="ticket-button ticket-button--ghost"
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setCommentMessage(comment.message || comment.body || "");
                                  }}
                                >
                                  Edit
                                </button>
                                <button className="ticket-button ticket-button--danger" type="button" onClick={() => removeComment(comment.id)}>
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                          <p>{comment.message || comment.body}</p>
                        </article>
                      );
                    })
                  ) : (
                    <div className="ticket-empty ticket-empty--soft">No comments yet. Start the thread below.</div>
                  )}
                </div>

                <label className="ticket-field">
                  <span>{editingCommentId ? "Edit Comment" : "New Comment"}</span>
                  <textarea
                    value={commentMessage}
                    onChange={(event) => setCommentMessage(event.target.value)}
                    placeholder="Add an update, note, or follow-up question"
                  />
                </label>

                <div className="ticket-inline-actions">
                  <button className="ticket-button ticket-button--primary" type="button" onClick={submitComment} disabled={busy || !commentMessage.trim()}>
                    {editingCommentId ? "Save Comment" : "Add Comment"}
                  </button>

                  {editingCommentId ? (
                    <button
                      className="ticket-button ticket-button--ghost"
                      type="button"
                      onClick={() => {
                        setEditingCommentId(null);
                        setCommentMessage("");
                      }}
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                </div>
              </div>

              {isAdmin && (
                <div className="ticket-inline-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="ticket-button ticket-button--danger" type="button" onClick={deleteSelectedTicket} disabled={busy}>
                    <Trash2 size={16} />
                    Delete Ticket
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ticket-empty ticket-empty--large">
              {detailLoading ? <Clock3 size={24} /> : <ClipboardList size={24} />}
              <span>{detailLoading ? "Loading ticket..." : "Select a ticket to view details."}</span>
            </div>
          )}
        </section>
      </div> : null}
    </section>
  );
}
