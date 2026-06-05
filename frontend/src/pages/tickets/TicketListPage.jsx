import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  LifeBuoy,
  Mail,
  MapPin,
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

const ticketCategories = [
  "HARDWARE",
  "SOFTWARE",
  "NETWORK",
  "PROJECTOR",
  "ELECTRICAL",
  "FACILITY",
  "SECURITY",
  "OTHER",
];

const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const ticketStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const reporterRoles = new Set(["STUDENT", "FACULTY"]);
const staffRoles = new Set(["ADMIN", "TECHNICIAN", "STAFF"]);

const emptyStatusUpdate = {
  status: "",
  rejectionReason: "",
  resolutionNotes: "",
};

const emptyAssignment = {
  assignedTo: "",
  assignedToName: "",
  assignedToEmail: "",
};

const emptyReportForm = (user) => ({
  resourceId: "",
  location: "",
  category: "HARDWARE",
  description: "",
  priority: "MEDIUM",
  preferredContactName: user?.name || "",
  preferredContactEmail: user?.email || "",
  preferredContactPhone: "",
  reporterName: user?.name || "",
  reporterEmail: user?.email || "",
});

function normalizeRole(role) {
  const value = String(role || "").trim().toUpperCase();
  return value || "STUDENT";
}

function canManageTickets(role) {
  return staffRoles.has(normalizeRole(role));
}

function canAssignTickets(role) {
  return normalizeRole(role) === "ADMIN";
}

function canDeleteTickets(role) {
  return normalizeRole(role) === "ADMIN";
}

function isReporterRole(role) {
  return reporterRoles.has(normalizeRole(role));
}

function roleTitle(role) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "Administrator";
    case "TECHNICIAN":
      return "Technician";
    case "STAFF":
      return "Campus Support Staff";
    case "FACULTY":
      return "Faculty Reporter";
    default:
      return "Student Reporter";
  }
}

function queueScope(role) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "Campus-wide queue";
    case "TECHNICIAN":
    case "STAFF":
      return "Assigned operations queue";
    default:
      return "Your submitted tickets";
  }
}

function heroCopy(role) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "Triage escalations, assign the right technician, and keep the campus support desk moving with clear status updates and an audit trail.";
    case "TECHNICIAN":
      return "Work the assigned incident queue, capture progress notes, and close each job with evidence and a clean handover.";
    case "STAFF":
      return "Coordinate the operational queue, update progress, and maintain a clear record for campus support activity.";
    case "FACULTY":
      return "Report classroom or office issues quickly, keep the contact details accurate, and follow the repair thread from one place.";
    default:
      return "Report room, network, electrical, or equipment issues with photos, then follow the repair process in one campus workspace.";
  }
}

function roleGuide(role) {
  if (canManageTickets(role)) {
    return [
      "Prioritize OPEN and IN_PROGRESS incidents first.",
      "Use assignment and status changes to show who owns the work.",
      "Add clear resolution notes so the reporter can see what changed.",
    ];
  }

  return [
    "Pick the room, lab, or equipment involved.",
    "Attach a photo if the issue is visible or physical.",
    "Keep the contact details accurate so the help desk can reach you.",
  ];
}

function buildFilterParams(filters, role, email) {
  const params = {};
  const normalizedRole = normalizeRole(role);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.category) params.category = filters.category;

  if (normalizedRole === "ADMIN") {
    return params;
  }

  if (normalizedRole === "TECHNICIAN" || normalizedRole === "STAFF") {
    if (normalizedEmail) params.assignedToEmail = normalizedEmail;
    return params;
  }

  if (normalizedEmail) params.reporterEmail = normalizedEmail;
  return params;
}

function getNextStatuses(status, role) {
  const currentRole = normalizeRole(role);
  const canClose = currentRole === "ADMIN";
  const canProgress = currentRole === "ADMIN" || currentRole === "TECHNICIAN" || currentRole === "STAFF";

  if (status === "OPEN") {
    if (currentRole === "ADMIN") return ["IN_PROGRESS", "REJECTED"];
    if (canProgress) return ["IN_PROGRESS"];
  }

  if (status === "IN_PROGRESS") {
    if (currentRole === "ADMIN") return ["RESOLVED", "REJECTED"];
    if (canProgress) return ["RESOLVED"];
  }

  if (status === "RESOLVED" && canClose) {
    return ["CLOSED"];
  }

  return [];
}

function prettyLabel(value) {
  return String(value || "").replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatBytes(bytes) {
  if (typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status) {
  return `ticket-badge ticket-badge--${String(status || "").toLowerCase()}`;
}

function priorityClass(priority) {
  return `ticket-pill ticket-pill--${String(priority || "").toLowerCase()}`;
}

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null) return;
  const stringValue = String(value).trim();
  if (!stringValue) return;
  formData.append(key, stringValue);
}

function MetricCard({ icon, label, value, accent, subtext }) {
  return (
    <div className={`ticket-stat-card ticket-stat-card--${accent}`}>
      <div className="ticket-stat-card__icon">{icon}</div>
      <div>
        <div className="ticket-stat-card__label">{label}</div>
        <div className="ticket-stat-card__value">{value}</div>
        {subtext ? <div className="ticket-stat-card__label">{subtext}</div> : null}
      </div>
    </div>
  );
}

function PanelTitle({ icon, eyebrow, title, action, subtitle }) {
  return (
    <div className="ticket-panel-title">
      <div className="ticket-panel-title__main">
        <div className="ticket-panel-title__icon">{icon}</div>
        <div>
          <div className="ticket-panel-title__eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          {subtitle ? (
            <p className="ticket-panel__subcopy" style={{ marginTop: 6 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

function InfoCard({ label, value, hint, icon }) {
  return (
    <div className="ticket-info-card">
      <span>
        {icon ? <>{icon} </> : null}
        {label}
      </span>
      <strong>{value || "-"}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function SlaCard({ label, detail, tone, meta }) {
  const colors =
    tone === "success"
      ? { background: "rgba(35, 163, 109, 0.12)", color: "#1d865b" }
      : tone === "danger"
        ? { background: "rgba(217, 87, 99, 0.14)", color: "#bd4052" }
        : tone === "warning"
          ? { background: "rgba(255, 141, 102, 0.14)", color: "#d05d35" }
          : { background: "rgba(15, 155, 215, 0.12)", color: "#0b78a8" };

  return (
    <div className="ticket-info-card">
      <span>{label}</span>
      <strong style={colors}>{detail}</strong>
      {meta ? <small>{meta}</small> : null}
    </div>
  );
}

function QueueItem({ ticket, active, onSelect }) {
  const sla = getSlaStatus(ticket.priority, ticket.createdAt, ticket.updatedAt, ticket.status, ticket.comments || []);
  const overdue = sla.response.remaining < 0 || sla.resolution.remaining < 0;

  return (
    <button className={`ticket-queue-item ${active ? "is-active" : ""}`} type="button" onClick={onSelect}>
      <div className="ticket-queue-item__top">
        <span className={statusClass(ticket.status)}>{prettyLabel(ticket.status)}</span>
        <span className={priorityClass(ticket.priority)}>{prettyLabel(ticket.priority)}</span>
      </div>
      <div className="ticket-queue-item__title">Ticket #{ticket.id}</div>
      <div className="ticket-queue-item__meta">{ticket.resourceName || ticket.location || "Campus issue"}</div>
      <div className="ticket-queue-item__meta" style={{ marginTop: 8 }}>
        {ticket.description}
      </div>
      <div className="ticket-queue-item__footer">
        <span>{ticket.assignedStaffName || ticket.assignedToName || "Unassigned"}</span>
        <span>{overdue ? "SLA attention needed" : formatSlaRemaining(sla.resolution.remaining)}</span>
      </div>
    </button>
  );
}

function AttachmentCard({ attachment, canDelete, onDelete }) {
  const downloadUrl = buildTicketAttachmentUrl(attachment);

  return (
    <div className="ticket-attachment-item">
      <div>
        <strong>{attachment.originalFileName || "Attachment"}</strong>
        <small>
          {formatBytes(attachment.fileSize)} {attachment.contentType ? `- ${attachment.contentType}` : ""}
        </small>
        <small>{formatDate(attachment.createdAt)}</small>
      </div>
      <div className="ticket-comment__actions">
        {downloadUrl ? (
          <a className="ticket-button ticket-button--ghost" href={downloadUrl} target="_blank" rel="noreferrer">
            Open
          </a>
        ) : null}
        {canDelete ? (
          <button className="ticket-button ticket-button--danger" type="button" onClick={onDelete} style={{ padding: "10px 14px" }}>
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CommentCard({ comment, viewerEmail, isAdmin, onEdit, onDelete }) {
  const authorEmail = String(comment.authorEmail || "").toLowerCase();
  const canEdit = Boolean(comment.editableByRequester || isAdmin || (viewerEmail && authorEmail === viewerEmail.toLowerCase()));
  const body = comment.body || comment.message || "";

  return (
    <div className="ticket-comment">
      <div className="ticket-comment__header">
        <div>
          <strong>{comment.authorName || "Anonymous"}</strong>
          <small>
            {comment.authorRole ? prettyLabel(comment.authorRole) : "Reporter"} - {formatDate(comment.createdAt)}
          </small>
        </div>
        {canEdit ? (
          <div className="ticket-comment__actions">
            <button className="ticket-button ticket-button--ghost" type="button" onClick={onEdit} style={{ padding: "8px 12px" }}>
              Edit
            </button>
            <button className="ticket-button ticket-button--danger" type="button" onClick={onDelete} style={{ padding: "8px 12px" }}>
              Delete
            </button>
          </div>
        ) : null}
      </div>
      <p>{body}</p>
    </div>
  );
}

export default function TicketListPage({ forcedRole = null }) {
  const { user, loading: authLoading } = useAuth();
  const activeRole = normalizeRole(forcedRole || user?.role);
  const userEmail = String(user?.email || "").trim().toLowerCase();
  const userName = user?.name || "Campus user";

  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", category: "" });
  const [reportForm, setReportForm] = useState(emptyReportForm(user));
  const [reportAttachments, setReportAttachments] = useState([]);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [statusUpdate, setStatusUpdate] = useState(emptyStatusUpdate);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [newAttachment, setNewAttachment] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: "info", message: "" });

  const title = useMemo(() => roleTitle(activeRole), [activeRole]);
  const queueLabel = useMemo(() => queueScope(activeRole), [activeRole]);
  const guidance = useMemo(() => roleGuide(activeRole), [activeRole]);

  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => {
      const left = `${a.name || ""} ${a.location || ""}`.toLowerCase();
      const right = `${b.name || ""} ${b.location || ""}`.toLowerCase();
      return left.localeCompare(right);
    });
  }, [resources]);

  const selectedResource = useMemo(() => {
    if (!reportForm.resourceId) return null;
    return resources.find((resource) => String(resource.id) === String(reportForm.resourceId)) || null;
  }, [reportForm.resourceId, resources]);

  const selectedTicketSla = useMemo(() => {
    if (!selectedTicket) return null;
    return getSlaStatus(
      selectedTicket.priority,
      selectedTicket.createdAt,
      selectedTicket.updatedAt,
      selectedTicket.status,
      selectedTicket.comments || [],
    );
  }, [selectedTicket]);

  const summary = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((ticket) => ["OPEN", "IN_PROGRESS"].includes(ticket.status)).length;
    const assigned = tickets.filter((ticket) => Boolean(ticket.assignedToEmail || ticket.assignedStaffEmail)).length;
    const overdue = tickets.filter((ticket) => {
      const sla = getSlaStatus(ticket.priority, ticket.createdAt, ticket.updatedAt, ticket.status, ticket.comments || []);
      return sla.response.remaining < 0 || sla.resolution.remaining < 0;
    }).length;

    return { total, open, assigned, overdue };
  }, [tickets]);

  const refreshTickets = useCallback(
    async (keepId = null) => {
      setListLoading(true);
      try {
        const params = buildFilterParams(filters, activeRole, userEmail);
        const response = await getTickets(params);
        const nextTickets = Array.isArray(response) ? response : [];
        setTickets(nextTickets);

        const nextSelectedId =
          (keepId && nextTickets.some((ticket) => ticket.id === keepId) && keepId) ||
          nextTickets[0]?.id ||
          null;

        setSelectedTicketId(nextSelectedId);
        if (!nextSelectedId) {
          setSelectedTicket(null);
        }
      } catch (error) {
        setFeedback({ type: "error", message: extractErrorMessage(error, "Failed to load tickets.") });
      } finally {
        setListLoading(false);
      }
    },
    [activeRole, filters, userEmail],
  );

  const refreshTicketDetail = useCallback(async (ticketId) => {
    if (!ticketId) {
      setSelectedTicket(null);
      return;
    }

    setDetailLoading(true);
    try {
      const response = await getTicketById(ticketId);
      setSelectedTicket(response);
    } catch (error) {
      setFeedback({ type: "error", message: extractErrorMessage(error, `Failed to load ticket #${ticketId}.`) });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    setReportForm((current) => {
      const next = { ...emptyReportForm(user), ...current };
      if (user?.name) {
        next.preferredContactName = current.preferredContactName || user.name;
        next.reporterName = current.reporterName || user.name;
      }
      if (user?.email) {
        next.preferredContactEmail = current.preferredContactEmail || user.email;
        next.reporterEmail = current.reporterEmail || user.email;
      }
      return next;
    });
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    void (async () => {
      try {
        const response = await getResources();
        if (!active) return;
        setResources(Array.isArray(response) ? response : []);
      } catch (error) {
        if (!active) return;
        setFeedback({ type: "error", message: extractErrorMessage(error, "Failed to load campus resources.") });
      }
    })();

    return () => {
      active = false;
    };
  }, [activeRole, authLoading, userEmail]);

  useEffect(() => {
    if (authLoading) return;
    void refreshTickets();
  }, [authLoading, refreshTickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    void refreshTicketDetail(selectedTicketId);
  }, [refreshTicketDetail, selectedTicketId]);

  useEffect(() => {
    if (!selectedTicket) return;

    setAssignment({
      assignedTo: selectedTicket.assignedTo || "",
      assignedToName: selectedTicket.assignedStaffName || selectedTicket.assignedToName || "",
      assignedToEmail: selectedTicket.assignedStaffEmail || selectedTicket.assignedToEmail || "",
    });
    setStatusUpdate({
      status: "",
      rejectionReason: selectedTicket.rejectionReason || "",
      resolutionNotes: selectedTicket.resolutionNotes || "",
    });
    setResolutionNotes(selectedTicket.resolutionNotes || "");
    setCommentMessage("");
    setEditingCommentId(null);
    setNewAttachment(null);
  }, [selectedTicket?.id]);

  const setFeedbackMessage = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const updateReportField = useCallback(
    (field, value) => {
      setReportForm((current) => {
        if (field === "resourceId") {
          const resource = resources.find((item) => String(item.id) === String(value));
          return {
            ...current,
            resourceId: value,
            location: resource?.location || current.location,
          };
        }

        return { ...current, [field]: value };
      });
    },
    [resources],
  );

  const submitReport = useCallback(
    async (event) => {
      event.preventDefault();

      if (!reportForm.description.trim()) {
        setFeedbackMessage("error", "Please add a short description before submitting.");
        return;
      }

      if (!reportForm.reporterEmail.trim() || !reportForm.preferredContactEmail.trim()) {
        setFeedbackMessage("error", "Reporter and contact email are required.");
        return;
      }

      setBusy(true);
      try {
        const formData = new FormData();
        appendFormValue(formData, "resourceId", reportForm.resourceId);
        appendFormValue(formData, "category", reportForm.category);
        appendFormValue(formData, "location", reportForm.location);
        appendFormValue(formData, "description", reportForm.description);
        appendFormValue(formData, "priority", reportForm.priority);
        appendFormValue(formData, "preferredContactName", reportForm.preferredContactName);
        appendFormValue(formData, "preferredContactEmail", reportForm.preferredContactEmail);
        appendFormValue(formData, "preferredContactPhone", reportForm.preferredContactPhone);
        appendFormValue(formData, "reporterName", reportForm.reporterName);
        appendFormValue(formData, "reporterEmail", reportForm.reporterEmail);
        reportAttachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const createdTicket = await createTicket(formData);
        setFeedbackMessage("success", `Ticket #${createdTicket.id} created successfully.`);
        setReportForm(emptyReportForm(user));
        setReportAttachments([]);
        await refreshTickets(createdTicket.id);
        await refreshTicketDetail(createdTicket.id);
      } catch (error) {
        setFeedbackMessage("error", extractErrorMessage(error, "Could not create ticket."));
      } finally {
        setBusy(false);
      }
    },
    [refreshTicketDetail, refreshTickets, reportAttachments, reportForm, setFeedbackMessage, user],
  );

  const submitAssignment = useCallback(async () => {
    if (!selectedTicket || !canAssignTickets(activeRole)) return;

    setBusy(true);
    try {
      await assignTicket(selectedTicket.id, {
        assignedTo: assignment.assignedTo.trim(),
        assignedToName: assignment.assignedToName.trim(),
        assignedToEmail: assignment.assignedToEmail.trim(),
        actorRole: activeRole,
      });
      setFeedbackMessage("success", `Ticket #${selectedTicket.id} assigned successfully.`);
      await refreshTickets(selectedTicket.id);
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not update assignment."));
    } finally {
      setBusy(false);
    }
  }, [activeRole, assignment, refreshTicketDetail, refreshTickets, selectedTicket, setFeedbackMessage]);

  const submitStatusUpdate = useCallback(async () => {
    if (!selectedTicket || !statusUpdate.status) return;

    setBusy(true);
    try {
      await updateTicketStatus(selectedTicket.id, {
        status: statusUpdate.status,
        rejectionReason: statusUpdate.rejectionReason.trim(),
        resolutionNotes: statusUpdate.resolutionNotes.trim(),
        actorEmail: userEmail,
        actorRole: activeRole,
      });
      setFeedbackMessage("success", `Ticket #${selectedTicket.id} status updated.`);
      setStatusUpdate(emptyStatusUpdate);
      await refreshTickets(selectedTicket.id);
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not update status."));
    } finally {
      setBusy(false);
    }
  }, [activeRole, refreshTicketDetail, refreshTickets, selectedTicket, setFeedbackMessage, statusUpdate, userEmail]);

  const submitResolution = useCallback(async () => {
    if (!selectedTicket || !canManageTickets(activeRole)) return;

    setBusy(true);
    try {
      const formData = new FormData();
      appendFormValue(formData, "resolutionNotes", resolutionNotes);
      appendFormValue(formData, "actorEmail", userEmail);
      appendFormValue(formData, "actorRole", activeRole);

      await updateTicketResolution(selectedTicket.id, formData);
      setFeedbackMessage("success", `Resolution notes saved for ticket #${selectedTicket.id}.`);
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not save resolution notes."));
    } finally {
      setBusy(false);
    }
  }, [activeRole, refreshTicketDetail, resolutionNotes, selectedTicket, setFeedbackMessage, userEmail]);

  const submitComment = useCallback(async () => {
    if (!selectedTicket || !commentMessage.trim()) return;

    setBusy(true);
    try {
      if (editingCommentId) {
        const formData = new FormData();
        appendFormValue(formData, "actorEmail", userEmail);
        appendFormValue(formData, "actorRole", activeRole);
        appendFormValue(formData, "body", commentMessage);
        await updateTicketComment(selectedTicket.id, editingCommentId, formData);
        setFeedbackMessage("success", "Comment updated.");
      } else {
        await addTicketComment(selectedTicket.id, {
          authorName: userName,
          authorEmail: userEmail,
          authorRole: activeRole,
          message: commentMessage,
        });
        setFeedbackMessage("success", "Comment added.");
      }

      setCommentMessage("");
      setEditingCommentId(null);
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not save comment."));
    } finally {
      setBusy(false);
    }
  }, [activeRole, commentMessage, editingCommentId, refreshTicketDetail, selectedTicket, setFeedbackMessage, userEmail, userName]);

  const removeComment = useCallback(
    async (commentId) => {
      if (!selectedTicket) return;

      setBusy(true);
      try {
        await deleteTicketComment(selectedTicket.id, commentId, {
          actorEmail: userEmail,
          actorRole: activeRole,
        });
        setFeedbackMessage("success", "Comment deleted.");
        await refreshTicketDetail(selectedTicket.id);
      } catch (error) {
        setFeedbackMessage("error", extractErrorMessage(error, "Could not delete comment."));
      } finally {
        setBusy(false);
      }
    },
    [activeRole, refreshTicketDetail, selectedTicket, setFeedbackMessage, userEmail],
  );

  const uploadAttachment = useCallback(async () => {
    if (!selectedTicket || !newAttachment) return;

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("attachment", newAttachment);
      await addTicketAttachment(selectedTicket.id, formData);
      setFeedbackMessage("success", "Attachment uploaded.");
      setNewAttachment(null);
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not upload attachment."));
    } finally {
      setBusy(false);
    }
  }, [newAttachment, refreshTicketDetail, selectedTicket, setFeedbackMessage]);

  const removeAttachment = useCallback(
    async (attachmentId) => {
      if (!selectedTicket) return;

      setBusy(true);
      try {
        await deleteTicketAttachment(selectedTicket.id, attachmentId);
        setFeedbackMessage("success", "Attachment deleted.");
        await refreshTicketDetail(selectedTicket.id);
      } catch (error) {
        setFeedbackMessage("error", extractErrorMessage(error, "Could not delete attachment."));
      } finally {
        setBusy(false);
      }
    },
    [refreshTicketDetail, selectedTicket, setFeedbackMessage],
  );

  const deleteSelectedTicket = useCallback(async () => {
    if (!selectedTicket) return;

    const confirmed = window.confirm(`Delete ticket #${selectedTicket.id}? This action cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    try {
      await deleteTicket(selectedTicket.id, activeRole);
      setFeedbackMessage("success", `Ticket #${selectedTicket.id} deleted.`);
      setSelectedTicket(null);
      setSelectedTicketId(null);
      await refreshTickets();
    } catch (error) {
      setFeedbackMessage("error", extractErrorMessage(error, "Could not delete ticket."));
    } finally {
      setBusy(false);
    }
  }, [activeRole, refreshTickets, selectedTicket, setFeedbackMessage]);

  const selectedTicketComments = selectedTicket?.comments || [];
  const selectedTicketAttachments = selectedTicket?.attachments || [];
  const nextStatuses = useMemo(() => getNextStatuses(selectedTicket?.status, activeRole), [activeRole, selectedTicket?.status]);

  if (authLoading) {
    return (
      <section className="tickets-page">
        <div className="ticket-empty ticket-empty--large">
          <Clock3 size={24} />
          <span>Loading campus ticket workspace...</span>
        </div>
      </section>
    );
  }

  if (!user && !forcedRole) {
    return (
      <section className="tickets-page">
        <div className="ticket-empty ticket-empty--large">
          <UserCircle2 size={24} />
          <span>Please sign in to access the campus ticket desk.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="tickets-page">
      <div className="tickets-page__backdrop" />

      <header className="tickets-hero">
        <div>
          <div className="tickets-hero__eyebrow">Campus ticket desk</div>
          <h1>Real-world maintenance and support workflow for the campus.</h1>
          <p>{heroCopy(activeRole)}</p>
        </div>

        <div className="tickets-hero__stats">
          <MetricCard icon={<ClipboardList size={20} />} label="Total tickets" value={summary.total} accent="blue" subtext={queueLabel} />
          <MetricCard icon={<LifeBuoy size={20} />} label="Open incidents" value={summary.open} accent="amber" subtext="Needs active attention" />
          <MetricCard icon={<ShieldCheck size={20} />} label="Assigned items" value={summary.assigned} accent="violet" subtext="Owned by support staff" />
          <MetricCard icon={<AlertTriangle size={20} />} label="SLA risk" value={summary.overdue} accent="green" subtext="Overdue response or resolution" />
        </div>
      </header>

      {feedback.message ? (
        <div
          className="tickets-feedback"
          style={
            feedback.type === "error"
              ? { background: "linear-gradient(90deg, rgba(147, 28, 39, 0.95), rgba(104, 20, 30, 0.92))" }
              : feedback.type === "success"
                ? { background: "linear-gradient(90deg, rgba(20, 117, 87, 0.95), rgba(23, 92, 145, 0.9))" }
                : undefined
          }
        >
          {feedback.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <div className="tickets-grid tickets-grid--top">
        <section className="ticket-panel">
          <PanelTitle
            icon={<UserCircle2 size={18} />}
            eyebrow="Session overview"
            title={`${title} workspace`}
            subtitle={`Current view: ${queueLabel.toLowerCase()}.`}
          />

          <div className="ticket-card--summary">
            <div className="ticket-card__heading">What you can do here</div>
            <div className="ticket-card__grid">
              <div>
                <strong>Role:</strong> {title}
              </div>
              <div>
                <strong>Access:</strong> {canManageTickets(activeRole) ? "Queue control, updates, and resolution" : "Issue reporting and progress tracking"}
              </div>
              <div>
                <strong>Contact:</strong> {userEmail || "No email on profile"}
              </div>
              <div>
                <strong>Reporting mode:</strong> {isReporterRole(activeRole) ? "Direct reporter workflow" : "Operations desk workflow"}
              </div>
            </div>
          </div>

          <div className="ticket-panel__hint">
            <strong>Recommended workflow:</strong> {guidance[0]} {guidance[1]} {guidance[2]}
          </div>

          <div className="ticket-detail-grid" style={{ marginTop: 16 }}>
            <InfoCard label="Open queue scope" value={queueLabel} hint="The list updates with your current role and filters." icon={<ClipboardList size={14} />} />
            <InfoCard label="Current user" value={userName} hint={userEmail || "No email available"} icon={<Mail size={14} />} />
          </div>
        </section>

        <section className="ticket-panel">
          <PanelTitle
            icon={<PlusCircle size={18} />}
            eyebrow="Report intake"
            title="Report a campus issue"
            subtitle="Use this form for classroom, lab, network, projector, electrical, security, or facility incidents."
          />

          <form onSubmit={submitReport}>
            <div className="ticket-form-grid">
              <label className="ticket-field ticket-field--full">
                <span>Linked resource</span>
                <select value={reportForm.resourceId} onChange={(event) => updateReportField("resourceId", event.target.value)}>
                  <option value="">No specific resource</option>
                  {resourceOptions.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} {resource.location ? `- ${resource.location}` : ""} {resource.type ? `(${resource.type})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field ticket-field--full">
                <span>Location</span>
                <input
                  value={reportForm.location}
                  onChange={(event) => updateReportField("location", event.target.value)}
                  placeholder={selectedResource?.location || "Main Block, Level 2, Lab 203"}
                />
              </label>

              <label className="ticket-field">
                <span>Category</span>
                <select value={reportForm.category} onChange={(event) => updateReportField("category", event.target.value)}>
                  {ticketCategories.map((category) => (
                    <option key={category} value={category}>
                      {prettyLabel(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Priority</span>
                <select value={reportForm.priority} onChange={(event) => updateReportField("priority", event.target.value)}>
                  {ticketPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {prettyLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field ticket-field--full">
                <span>Description</span>
                <textarea
                  value={reportForm.description}
                  onChange={(event) => updateReportField("description", event.target.value)}
                  placeholder="Describe the issue clearly, mention the room or equipment number, and include any impact on classes or work."
                />
              </label>

              <label className="ticket-field">
                <span>Preferred contact name</span>
                <input value={reportForm.preferredContactName} onChange={(event) => updateReportField("preferredContactName", event.target.value)} />
              </label>

              <label className="ticket-field">
                <span>Preferred contact email</span>
                <input
                  type="email"
                  value={reportForm.preferredContactEmail}
                  onChange={(event) => updateReportField("preferredContactEmail", event.target.value)}
                />
              </label>

              <label className="ticket-field">
                <span>Preferred contact phone</span>
                <input
                  value={reportForm.preferredContactPhone}
                  onChange={(event) => updateReportField("preferredContactPhone", event.target.value)}
                  placeholder="+94 77 123 4567"
                />
              </label>

              <label className="ticket-field">
                <span>Reporter name</span>
                <input value={reportForm.reporterName} onChange={(event) => updateReportField("reporterName", event.target.value)} />
              </label>

              <label className="ticket-field ticket-field--full">
                <span>Reporter email</span>
                <input type="email" value={reportForm.reporterEmail} onChange={(event) => updateReportField("reporterEmail", event.target.value)} />
              </label>

              <div className="ticket-field ticket-field--full ticket-upload">
                <span>Supporting attachments</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  multiple
                  onChange={(event) => setReportAttachments(Array.from(event.target.files || []))}
                />
                <div className="ticket-upload__helper">Attach photos, screenshots, or a short PDF note if it helps the technician understand the issue.</div>
                {reportAttachments.length ? (
                  <div className="ticket-upload__preview">
                    {reportAttachments.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="ticket-upload__preview-item">
                        <Paperclip size={14} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <button className="ticket-button ticket-button--primary" type="submit" disabled={busy}>
              Submit campus ticket
            </button>
          </form>
        </section>
      </div>

      <div className="tickets-grid tickets-grid--main">
        <section className="ticket-panel ticket-panel--queue">
          <PanelTitle
            icon={<Filter size={18} />}
            eyebrow="Queue"
            title="Live ticket list"
            subtitle="Search, filter, and open the ticket that needs your attention next."
            action={
              <button className="ticket-button ticket-button--ghost" type="button" onClick={() => refreshTickets(selectedTicketId)} disabled={listLoading || busy}>
                Refresh
              </button>
            }
          />

          <div className="ticket-filter-stack">
            <label className="ticket-search">
              <Search size={18} />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search by ticket, location, or description"
              />
            </label>

            <div className="ticket-form-grid ticket-form-grid--single">
              <label className="ticket-field">
                <span>Status</span>
                <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option value="">All statuses</option>
                  {ticketStatuses.map((status) => (
                    <option key={status} value={status}>
                      {prettyLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Priority</span>
                <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="">All priorities</option>
                  {ticketPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {prettyLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Category</span>
                <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                  <option value="">All categories</option>
                  {ticketCategories.map((category) => (
                    <option key={category} value={category}>
                      {prettyLabel(category)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {listLoading ? (
            <div className="ticket-empty ticket-empty--soft">
              <Clock3 size={18} />
              <span>Loading tickets...</span>
            </div>
          ) : tickets.length ? (
            <div className="ticket-queue">
              {tickets.map((ticket) => (
                <QueueItem key={ticket.id} ticket={ticket} active={selectedTicketId === ticket.id} onSelect={() => setSelectedTicketId(ticket.id)} />
              ))}
            </div>
          ) : (
            <div className="ticket-empty ticket-empty--soft">
              <ClipboardList size={18} />
              <span>No tickets match the current filters.</span>
            </div>
          )}
        </section>

        <section className="ticket-panel ticket-panel--details">
          {selectedTicket ? (
            <div className="ticket-detail">
              <div className="ticket-detail__header">
                <div>
                  <div className="tickets-hero__eyebrow">Ticket detail</div>
                  <h2>Ticket #{selectedTicket.id}</h2>
                  <p>{selectedTicket.description}</p>
                </div>
                <div className="ticket-detail__badges">
                  <span className={statusClass(selectedTicket.status)}>{prettyLabel(selectedTicket.status)}</span>
                  <span className={priorityClass(selectedTicket.priority)}>{prettyLabel(selectedTicket.priority)}</span>
                  <span className="ticket-pill" style={{ background: "rgba(22, 49, 78, 0.08)", color: "#16314e" }}>
                    {selectedTicket.resourceName || selectedTicket.location || "Campus issue"}
                  </span>
                </div>
              </div>

              <div className="ticket-info-grid">
                <InfoCard label="Reporter" value={selectedTicket.reporterName} hint={selectedTicket.reporterEmail} icon={<UserCircle2 size={14} />} />
                <InfoCard label="Location" value={selectedTicket.location} hint={selectedTicket.resourceName || "No linked resource"} icon={<MapPin size={14} />} />
                <InfoCard
                  label="Assigned technician"
                  value={selectedTicket.assignedStaffName || selectedTicket.assignedToName || "Unassigned"}
                  hint={selectedTicket.assignedStaffEmail || selectedTicket.assignedToEmail || "No technician assigned yet"}
                  icon={<ShieldCheck size={14} />}
                />
                <InfoCard label="Timeline" value={formatDate(selectedTicket.createdAt)} hint={`Updated ${formatDate(selectedTicket.updatedAt)}`} icon={<Clock3 size={14} />} />
              </div>

              {selectedTicketSla ? (
                <div className="ticket-info-grid">
                  <SlaCard
                    label="Response target"
                    detail={selectedTicketSla.response.label}
                    tone={selectedTicketSla.response.met === false ? "danger" : selectedTicketSla.response.met === true ? "success" : "info"}
                    meta={
                      selectedTicketSla.response.met === null
                        ? `Due ${selectedTicketSla.response.deadline.toLocaleString()}`
                        : formatSlaRemaining(selectedTicketSla.response.remaining)
                    }
                  />
                  <SlaCard
                    label="Resolution target"
                    detail={selectedTicketSla.resolution.label}
                    tone={selectedTicketSla.resolution.met === false ? "danger" : selectedTicketSla.resolution.met === true ? "success" : "warning"}
                    meta={
                      selectedTicketSla.resolution.met === null
                        ? `Due ${selectedTicketSla.resolution.deadline.toLocaleString()}`
                        : formatSlaRemaining(selectedTicketSla.resolution.remaining)
                    }
                  />
                  <InfoCard label="Comments" value={selectedTicket.comments?.length || 0} hint="Conversation history" icon={<MessageSquareText size={14} />} />
                  <InfoCard label="Attachments" value={selectedTicket.attachments?.length || 0} hint="Evidence and photos" icon={<Paperclip size={14} />} />
                </div>
              ) : null}

              {canManageTickets(activeRole) ? (
                <div className="ticket-detail-grid">
                  <div className="ticket-detail-section">
                    <PanelTitle icon={<Wrench size={18} />} eyebrow="Workflow" title="Status update" />
                    <div className="ticket-form-grid ticket-form-grid--single">
                      <label className="ticket-field">
                        <span>Move to status</span>
                        <select value={statusUpdate.status} onChange={(event) => setStatusUpdate((current) => ({ ...current, status: event.target.value }))}>
                          <option value="">Choose a status</option>
                          {nextStatuses.map((status) => (
                            <option key={status} value={status}>
                              {prettyLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {statusUpdate.status === "REJECTED" ? (
                        <label className="ticket-field">
                          <span>Rejection reason</span>
                          <textarea
                            value={statusUpdate.rejectionReason}
                            onChange={(event) => setStatusUpdate((current) => ({ ...current, rejectionReason: event.target.value }))}
                            placeholder="Explain why this request was rejected so the reporter understands the decision."
                          />
                        </label>
                      ) : null}

                      {statusUpdate.status === "RESOLVED" ? (
                        <label className="ticket-field">
                          <span>Resolution summary</span>
                          <textarea
                            value={statusUpdate.resolutionNotes}
                            onChange={(event) => setStatusUpdate((current) => ({ ...current, resolutionNotes: event.target.value }))}
                            placeholder="Summarize diagnostics, repair steps, and the final outcome."
                          />
                        </label>
                      ) : null}
                    </div>

                    <button className="ticket-button ticket-button--ghost" type="button" onClick={submitStatusUpdate} disabled={busy || !statusUpdate.status}>
                      Update status
                    </button>
                  </div>

                  {canAssignTickets(activeRole) ? (
                    <div className="ticket-detail-section">
                      <PanelTitle
                        icon={<ShieldCheck size={18} />}
                        eyebrow="Admin action"
                        title="Assign technician"
                        action={
                          <button
                            className="ticket-button ticket-button--ghost"
                            style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                            type="button"
                            onClick={() => {
                              setAssignment({
                                assignedTo: user?.id ? String(user.id) : "",
                                assignedToName: userName,
                                assignedToEmail: userEmail,
                              });
                            }}
                          >
                            Self-assign
                          </button>
                        }
                      />
                      <div className="ticket-form-grid">
                        <label className="ticket-field">
                          <span>Technician id</span>
                          <input
                            value={assignment.assignedTo}
                            onChange={(event) => setAssignment((current) => ({ ...current, assignedTo: event.target.value }))}
                            placeholder="TECH-001"
                          />
                        </label>
                        <label className="ticket-field">
                          <span>Technician name</span>
                          <input
                            value={assignment.assignedToName}
                            onChange={(event) => setAssignment((current) => ({ ...current, assignedToName: event.target.value }))}
                          />
                        </label>
                        <label className="ticket-field ticket-field--full">
                          <span>Technician email</span>
                          <input
                            value={assignment.assignedToEmail}
                            onChange={(event) => setAssignment((current) => ({ ...current, assignedToEmail: event.target.value }))}
                          />
                        </label>
                      </div>
                      <button className="ticket-button ticket-button--ghost" style={{ marginTop: "1rem" }} type="button" onClick={submitAssignment} disabled={busy}>
                        Save assignment
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {canManageTickets(activeRole) ? (
                <div className="ticket-detail-grid">
                  <div className="ticket-detail-section">
                    <PanelTitle icon={<Wrench size={18} />} eyebrow="Closeout" title="Resolution notes" />
                    <label className="ticket-field">
                      <span>Resolution summary</span>
                      <textarea
                        value={resolutionNotes}
                        onChange={(event) => setResolutionNotes(event.target.value)}
                        placeholder="Summarize the repair, replacement, or follow-up action."
                      />
                    </label>
                    <button className="ticket-button ticket-button--ghost" type="button" onClick={submitResolution} disabled={busy}>
                      Save resolution
                    </button>
                  </div>

                  <div className="ticket-detail-section">
                    <PanelTitle icon={<Paperclip size={18} />} eyebrow="Evidence" title="Attachments" />
                    <div className="ticket-attachment-list">
                      {selectedTicketAttachments.length ? (
                        selectedTicketAttachments.map((attachment) => (
                          <AttachmentCard
                            key={attachment.id}
                            attachment={attachment}
                            canDelete={canManageTickets(activeRole) || selectedTicket.reporterEmail?.toLowerCase() === userEmail}
                            onDelete={() => removeAttachment(attachment.id)}
                          />
                        ))
                      ) : (
                        <div className="ticket-empty ticket-empty--soft">No attachments uploaded yet.</div>
                      )}
                    </div>

                    <div className="ticket-upload" style={{ marginTop: "1rem" }}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={(event) => setNewAttachment(event.target.files?.[0] || null)}
                      />
                    </div>

                    <button className="ticket-button ticket-button--ghost" type="button" onClick={uploadAttachment} disabled={busy || !newAttachment}>
                      Upload attachment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ticket-detail-section">
                  <PanelTitle icon={<Paperclip size={18} />} eyebrow="Evidence" title="Attachments" />
                  <div className="ticket-attachment-list">
                    {selectedTicketAttachments.length ? (
                      selectedTicketAttachments.map((attachment) => (
                        <AttachmentCard
                          key={attachment.id}
                          attachment={attachment}
                          canDelete={selectedTicket.reporterEmail?.toLowerCase() === userEmail}
                          onDelete={() => removeAttachment(attachment.id)}
                        />
                      ))
                    ) : (
                      <div className="ticket-empty ticket-empty--soft">No attachments uploaded yet.</div>
                    )}
                  </div>

                  <div className="ticket-upload" style={{ marginTop: "1rem" }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(event) => setNewAttachment(event.target.files?.[0] || null)}
                    />
                  </div>

                  <button className="ticket-button ticket-button--ghost" type="button" onClick={uploadAttachment} disabled={busy || !newAttachment}>
                    Upload attachment
                  </button>
                </div>
              )}

              {selectedTicket.rejectionReason ? (
                <div className="ticket-detail-section">
                  <PanelTitle icon={<AlertTriangle size={18} />} eyebrow="Rejected" title="Rejection reason" />
                  <p>{selectedTicket.rejectionReason}</p>
                </div>
              ) : null}

              <div className="ticket-detail-section ticket-detail-section--comments">
                <PanelTitle icon={<MessageSquareText size={18} />} eyebrow="Collaboration" title="Comments" />

                <div className="ticket-comments">
                  {selectedTicketComments.length ? (
                    selectedTicketComments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        viewerEmail={userEmail}
                        isAdmin={normalizeRole(activeRole) === "ADMIN"}
                        onEdit={() => {
                          setEditingCommentId(comment.id);
                          setCommentMessage(comment.body || comment.message || "");
                        }}
                        onDelete={() => removeComment(comment.id)}
                      />
                    ))
                  ) : (
                    <div className="ticket-empty ticket-empty--soft">No comments yet. Start the thread below.</div>
                  )}
                </div>

                <label className="ticket-field">
                  <span>{editingCommentId ? "Edit comment" : "New comment"}</span>
                  <textarea
                    value={commentMessage}
                    onChange={(event) => setCommentMessage(event.target.value)}
                    placeholder="Add an update, note, or follow-up question."
                  />
                </label>

                <div className="ticket-inline-actions">
                  <button className="ticket-button ticket-button--primary" type="button" onClick={submitComment} disabled={busy || !commentMessage.trim()}>
                    {editingCommentId ? "Save comment" : "Add comment"}
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
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </div>

              {canDeleteTickets(activeRole) ? (
                <div className="ticket-inline-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="ticket-button ticket-button--danger" type="button" onClick={deleteSelectedTicket} disabled={busy}>
                    <Trash2 size={16} />
                    Delete ticket
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="ticket-empty ticket-empty--large">
              {detailLoading ? <Clock3 size={24} /> : <ClipboardList size={24} />}
              <span>{detailLoading ? "Loading ticket..." : "Select a ticket to view details."}</span>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
