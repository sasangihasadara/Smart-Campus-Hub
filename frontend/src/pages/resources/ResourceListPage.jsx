import { useMemo, useState } from "react";
import { Boxes, Edit3, Eye, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useResources } from "../../context/ResourceContext";
import {
  EMPTY_RESOURCE_FORM,
  RESOURCE_FORM_LIMITS,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  downloadCsv,
  filterResources,
  formatAvailability,
  statusClass,
  statusLabel,
  summarizeResources,
  typeClass,
  typeLabel,
  validateResourceForm,
} from "../../utils/resourceModule";

const DEFAULT_FILTERS = {
  search: "",
  type: "",
  status: "",
  capacity: "",
};

function getFirstErrorMessage(errors) {
  return Object.values(errors)[0] ?? "Please review the form and try again.";
}

function StatCard({ label, value, tone }) {
  return (
    <div className="resource-stat-card">
      <div className="resource-stat-card__label">{label}</div>
      <div className={`resource-stat-card__value ${tone}`}>{value}</div>
    </div>
  );
}

function Modal({
  open,
  title,
  titleMeta,
  titleIcon,
  onClose,
  children,
  footer,
  confirmStyle = false,
  modalClassName = "",
}) {
  if (!open) return null;

  return (
    <div className="resource-modal-overlay" onClick={onClose}>
      <div
        className={`resource-modal ${confirmStyle ? "resource-modal--confirm" : ""} ${modalClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="resource-modal__header">
          <div className="resource-modal__title-wrap">
            {titleIcon ? <div className="resource-modal__title-icon">{titleIcon}</div> : null}
            <div>
              {titleMeta ? <div className="resource-modal__meta">{titleMeta}</div> : null}
              <div className="resource-modal__title">{title}</div>
            </div>
          </div>
          <button className="resource-modal__close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="resource-modal__body">{children}</div>
        {footer ? <div className="resource-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function ToastStack({ items }) {
  return (
    <div className="resource-toast-stack">
      {items.map((toast) => (
        <div key={toast.id} className={`resource-toast ${toast.type}`}>
          <span className="resource-toast__icon">{toast.type === "success" ? "OK" : "!"}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResourceListPage() {
  const location = useLocation();
  const {
    resources,
    loading,
    createResource: createResourceItem,
    updateResource: updateResourceItem,
    deleteResource: deleteResourceItem,
  } = useResources();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [form, setForm] = useState(EMPTY_RESOURCE_FORM);
  const [editingId, setEditingId] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const summary = summarizeResources(resources);
  const filteredResources = useMemo(
    () => filterResources(resources, filters),
    [filters, resources]
  );
  const formValidation = useMemo(
    () => validateResourceForm(form, resources, editingId),
    [editingId, form, resources]
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isAdminResourceView = location.pathname.startsWith("/admin/resources");

  const pushToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setForm(EMPTY_RESOURCE_FORM);
    setTouchedFields({});
    setSubmitAttempted(false);
    setIsSaving(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_RESOURCE_FORM);
    setTouchedFields({});
    setSubmitAttempted(false);
    setShowFormModal(true);
  };

  const openEditModal = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: String(resource.capacity ?? ""),
      location: resource.location,
      status: resource.status,
      availFrom: resource.availFrom || "08:00",
      availUntil: resource.availUntil || "18:00",
      description: resource.description || "",
    });
    setTouchedFields({});
    setSubmitAttempted(false);
    setShowFormModal(true);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const markTouched = (field) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const getFieldError = (field) => {
    if (!submitAttempted && !touchedFields[field]) {
      return "";
    }

    return formValidation.errors[field] ?? "";
  };

  const saveResource = async () => {
    setSubmitAttempted(true);
    setTouchedFields({
      name: true,
      type: true,
      capacity: true,
      location: true,
      status: true,
      availFrom: true,
      availUntil: true,
      description: true,
    });

    if (!formValidation.isValid) {
      pushToast(getFirstErrorMessage(formValidation.errors), "error");
      return;
    }

    const payload = {
      ...formValidation.values,
      capacity: Number(formValidation.values.capacity),
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await updateResourceItem(editingId, payload);
        pushToast("Resource updated successfully.");
      } else {
        await createResourceItem(payload);
        pushToast("Resource added successfully.");
      }
      closeFormModal();
    } catch (error) {
      pushToast(error.message || "Unable to save resource.", "error");
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      await deleteResourceItem(resourceToDelete.id);
      setResourceToDelete(null);
      pushToast("Resource deleted.");
    } catch (error) {
      pushToast(error.message || "Unable to delete resource.", "error");
    }
  };

  return (
    <section className="resource-page">
      <div className="resource-page__title">Facilities and Assets</div>
      <div className="resource-page__sub">
        Manage campus facilities, spaces, and shared equipment from one place.
      </div>

      <div className="resource-stats-grid">
        <StatCard label="Total Resources" value={summary.total} tone="blue" />
        <StatCard label="Active" value={summary.active} tone="green" />
        <StatCard label="Out of Service" value={summary.outOfService} tone="red" />
        <StatCard label="Maintenance" value={summary.maintenance} tone="orange" />
      </div>

      <div className="resource-toolbar">
        <div className="resource-toolbar__group resource-toolbar__group--search">
          <span className="resource-toolbar__label">Find a Resource</span>
          <div className="resource-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </div>
        </div>

        <label className="resource-toolbar__group">
          <span className="resource-toolbar__label">Type</span>
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({ ...current, type: event.target.value }))
            }
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="resource-toolbar__group">
          <span className="resource-toolbar__label">Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="resource-toolbar__group">
          <span className="resource-toolbar__label">Capacity</span>
          <select
            value={filters.capacity}
            onChange={(event) =>
              setFilters((current) => ({ ...current, capacity: event.target.value }))
            }
          >
            <option value="">Any Capacity</option>
            <option value="small">1-20</option>
            <option value="medium">21-50</option>
            <option value="large">51+</option>
          </select>
        </label>

        <div className="resource-toolbar__meta">
          <div className="resource-toolbar__count">
            {filteredResources.length} result{filteredResources.length === 1 ? "" : "s"}
            {activeFilterCount ? ` | ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active` : ""}
          </div>
          <div className="resource-toolbar__actions">
            {isAdminResourceView ? (
              <button className="resource-btn resource-btn--primary" type="button" onClick={openAddModal}>
                <Plus size={16} />
                <span>Add Resource</span>
              </button>
            ) : null}

            <button
              className="resource-btn resource-btn--ghost"
              type="button"
              onClick={() => downloadCsv(filteredResources, "resources-table.csv")}
              disabled={!filteredResources.length}
            >
              Export CSV
            </button>

            <button
              className="resource-btn resource-btn--ghost"
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              disabled={!activeFilterCount}
            >
              <RotateCcw size={15} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="resource-cards">
        {loading ? (
          <div className="resource-empty">
            <div className="resource-empty__title">Loading resources</div>
            <div className="resource-empty__sub">Preparing the latest view.</div>
          </div>
        ) : filteredResources.length ? (
          filteredResources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-card__header">
                <div className="resource-card__name">{resource.name}</div>
                <div className="resource-card__type">
                  <span className={`resource-chip ${typeClass(resource.type)}`}>
                    {typeLabel(resource.type)}
                  </span>
                </div>
              </div>
              <div className="resource-card__body">
                <div className="resource-card__row">
                  <span>Capacity:</span>
                  <strong>{resource.capacity || "-"}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Location:</span>
                  <strong>{resource.location}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Availability:</span>
                  <strong>{formatAvailability(resource)}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Status:</span>
                  <span className={`resource-status ${statusClass(resource.status)}`}>
                    <span className="resource-status__dot" />
                    {statusLabel(resource.status)}
                  </span>
                </div>
              </div>
              <div className="resource-card__actions">
                <button
                  className="resource-icon-btn"
                  type="button"
                  onClick={() => setSelectedResource(resource)}
                  aria-label={`View ${resource.name}`}
                >
                  <Eye size={14} />
                </button>
                {isAdminResourceView ? (
                  <>
                    <button
                      className="resource-icon-btn"
                      type="button"
                      onClick={() => openEditModal(resource)}
                      aria-label={`Edit ${resource.name}`}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="resource-icon-btn danger"
                      type="button"
                      onClick={() => setResourceToDelete(resource)}
                      aria-label={`Delete ${resource.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="resource-empty">
            <div className="resource-empty__title">No resources found</div>
            <div className="resource-empty__sub">
              Try a different search or clear one of the filters.
            </div>
          </div>
        )}
      </div>

      {isAdminResourceView ? (
        <Modal
          open={showFormModal}
          title={editingId ? "Edit Resource" : "Add New Resource"}
          titleMeta={editingId ? "Update Campus Asset" : "Create Campus Asset"}
          titleIcon={<Boxes size={18} />}
          onClose={closeFormModal}
          modalClassName="resource-modal--resource-form"
          footer={
            <>
              <button className="resource-btn resource-btn--ghost" type="button" onClick={closeFormModal}>
                Cancel
              </button>
              <button
                className="resource-btn resource-btn--primary"
                type="button"
                onClick={saveResource}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Resource"}
              </button>
            </>
          }
        >
          <div className="resource-form-grid">
            <div className="resource-form-section resource-form-section--full">
              <span className="resource-form-section__label">Basic Information</span>
            </div>

          <label className="resource-form-group resource-form-group--full">
            <span>Resource Name *</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="e.g. Lab 101 - Computer Lab"
              maxLength={RESOURCE_FORM_LIMITS.nameMax}
              aria-invalid={Boolean(getFieldError("name"))}
              className={getFieldError("name") ? "is-invalid" : ""}
            />
            {getFieldError("name") ? (
              <div className="resource-form-feedback error">{getFieldError("name")}</div>
            ) : null}
          </label>

          <label className="resource-form-group">
            <span>Type *</span>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              onBlur={() => markTouched("type")}
              aria-invalid={Boolean(getFieldError("type"))}
              className={getFieldError("type") ? "is-invalid" : ""}
            >
              <option value="">Select type...</option>
              {RESOURCE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {getFieldError("type") ? (
              <div className="resource-form-feedback error">{getFieldError("type")}</div>
            ) : null}
          </label>

          <label className="resource-form-group">
            <span>Capacity *</span>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(event) => updateField("capacity", event.target.value)}
              onBlur={() => markTouched("capacity")}
              placeholder="e.g. 30"
              aria-invalid={Boolean(getFieldError("capacity"))}
              className={getFieldError("capacity") ? "is-invalid" : ""}
            />
            {getFieldError("capacity") ? (
              <div className="resource-form-feedback error">{getFieldError("capacity")}</div>
            ) : null}
          </label>

          <label className="resource-form-group">
            <span>Location / Building *</span>
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              onBlur={() => markTouched("location")}
              placeholder="e.g. Block A, Floor 2"
              maxLength={RESOURCE_FORM_LIMITS.locationMax}
              aria-invalid={Boolean(getFieldError("location"))}
              className={getFieldError("location") ? "is-invalid" : ""}
            />
            {getFieldError("location") ? (
              <div className="resource-form-feedback error">{getFieldError("location")}</div>
            ) : null}
          </label>

          <label className="resource-form-group">
            <span>Status *</span>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              onBlur={() => markTouched("status")}
              aria-invalid={Boolean(getFieldError("status"))}
              className={getFieldError("status") ? "is-invalid" : ""}
            >
              {RESOURCE_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {getFieldError("status") ? (
              <div className="resource-form-feedback error">{getFieldError("status")}</div>
            ) : null}
          </label>

          <div className="resource-form-section resource-form-section--full">
            <span className="resource-form-section__label">Availability</span>
          </div>

          <label className="resource-form-group">
            <span>Available From *</span>
            <input
              type="time"
              value={form.availFrom}
              onChange={(event) => updateField("availFrom", event.target.value)}
              onBlur={() => markTouched("availFrom")}
              aria-invalid={Boolean(getFieldError("availFrom"))}
              className={getFieldError("availFrom") ? "is-invalid" : ""}
            />
            {getFieldError("availFrom") ? (
              <div className="resource-form-feedback error">{getFieldError("availFrom")}</div>
            ) : null}
          </label>

          <label className="resource-form-group">
            <span>Available Until *</span>
            <input
              type="time"
              value={form.availUntil}
              onChange={(event) => updateField("availUntil", event.target.value)}
              onBlur={() => markTouched("availUntil")}
              aria-invalid={Boolean(getFieldError("availUntil"))}
              className={getFieldError("availUntil") ? "is-invalid" : ""}
            />
            {getFieldError("availUntil") ? (
              <div className="resource-form-feedback error">{getFieldError("availUntil")}</div>
            ) : null}
          </label>

          <div className="resource-form-section resource-form-section--full">
            <span className="resource-form-section__label">Additional Notes</span>
          </div>

          <label className="resource-form-group resource-form-group--full">
            <span>Description / Notes</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              onBlur={() => markTouched("description")}
              placeholder="Any additional details..."
              maxLength={RESOURCE_FORM_LIMITS.descriptionMax}
              aria-invalid={Boolean(getFieldError("description"))}
              className={getFieldError("description") ? "is-invalid" : ""}
            />
            {getFieldError("description") ? (
              <div className="resource-form-feedback error">{getFieldError("description")}</div>
            ) : null}
          </label>
          </div>
        </Modal>
      ) : null}

      <Modal
        open={Boolean(selectedResource)}
        title="Resource Details"
        onClose={() => setSelectedResource(null)}
        footer={
          <button
            className="resource-btn resource-btn--ghost"
            type="button"
            onClick={() => setSelectedResource(null)}
          >
            Close
          </button>
        }
      >
        {selectedResource ? (
          <div className="resource-detail">
            <div className="resource-detail__headline">
              <div className="resource-detail__name">{selectedResource.name}</div>
              <div className="resource-detail__chips">
                <span className={`resource-chip ${typeClass(selectedResource.type)}`}>
                  {typeLabel(selectedResource.type)}
                </span>
                <span className={`resource-status ${statusClass(selectedResource.status)}`}>
                  <span className="resource-status__dot" />
                  {statusLabel(selectedResource.status)}
                </span>
              </div>
            </div>

            <div className="resource-detail__rows">
              <div className="resource-detail__row">
                <span>Resource ID</span>
                <strong>#{selectedResource.id}</strong>
              </div>
              <div className="resource-detail__row">
                <span>Capacity</span>
                <strong>{selectedResource.capacity || "N/A"}</strong>
              </div>
              <div className="resource-detail__row">
                <span>Location</span>
                <strong>{selectedResource.location}</strong>
              </div>
              <div className="resource-detail__row">
                <span>Availability</span>
                <strong>{formatAvailability(selectedResource)}</strong>
              </div>
              <div className="resource-detail__row resource-detail__row--stack">
                <span>Description</span>
                <strong>{selectedResource.description || "No description available."}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {isAdminResourceView ? (
        <Modal
          open={Boolean(resourceToDelete)}
          title="Delete Resource"
          onClose={() => setResourceToDelete(null)}
          confirmStyle
          footer={
            <>
              <button
                className="resource-btn resource-btn--ghost"
                type="button"
                onClick={() => setResourceToDelete(null)}
              >
                Cancel
              </button>
              <button className="resource-btn resource-btn--danger" type="button" onClick={confirmDelete}>
                Delete Resource
              </button>
            </>
          }
        >
          <p className="resource-confirm-copy">
            Are you sure you want to delete{" "}
            <strong>{resourceToDelete?.name}</strong>? This action cannot be undone.
          </p>
        </Modal>
      ) : null}

      <ToastStack items={toasts} />
    </section>
  );
}
