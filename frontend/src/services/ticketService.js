import api from "./api";

const unwrapData = (response) => response.data?.data ?? response.data;
const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export const getTickets = (params = {}) => api.get("/tickets", { params }).then(unwrapData);

export const getTicketById = (id) => api.get(`/tickets/${id}`).then(unwrapData);

export const createTicket = (formData) =>
  api.post("/tickets", formData).then(unwrapData);

export const assignTicket = (id, payload) =>
  api.patch(`/tickets/${id}/assign`, payload).then(unwrapData);

export const updateTicketStatus = (id, payload) =>
  api.patch(`/tickets/${id}/status`, payload).then(unwrapData);

export const updateTicketResolution = (id, formData) =>
  api.patch(`/tickets/${id}/resolution`, formData).then(unwrapData);

export const addTicketComment = (id, payload) =>
  api.post(`/tickets/${id}/comments`, payload).then(unwrapData);

export const updateTicketComment = (ticketId, commentId, formData) =>
  api.patch(`/tickets/${ticketId}/comments/${commentId}`, formData).then(unwrapData);

export const deleteTicketComment = (ticketId, commentId, params) =>
  api
    .delete(`/tickets/${ticketId}/comments/${commentId}`, {
      params,
    })
    .then(unwrapData);

export const addTicketAttachment = (id, formData) =>
  api.post(`/tickets/${id}/attachments`, formData).then(unwrapData);

export const deleteTicketAttachment = (ticketId, attachmentId) =>
  api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`).then(unwrapData);

export const deleteTicket = (ticketId, actorRole) =>
  api.delete(`/tickets/${ticketId}`, { params: { actorRole } }).then(unwrapData);

export const buildTicketAttachmentUrl = (attachment) => {
  if (!attachment?.downloadUrl) {
    return "";
  }
  return attachment.downloadUrl.startsWith("http")
    ? attachment.downloadUrl
    : `${baseUrl}${attachment.downloadUrl.replace(/^\/api/, "")}`;
};
