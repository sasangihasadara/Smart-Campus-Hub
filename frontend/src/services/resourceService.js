import api from "./api";

const unwrapData = (response) => response.data?.data ?? response.data;

// GET all
export const getResources = (params = {}) => api.get("/resources", { params }).then(unwrapData);

// GET by id
export const getResourceById = (id) => api.get(`/resources/${id}`).then(unwrapData);

// GET summary
export const getResourceSummary = () => api.get("/resources/summary").then(unwrapData);

// CREATE
export const createResource = (data) => api.post("/resources", data).then(unwrapData);

// UPDATE
export const updateResource = (id, data) => api.put(`/resources/${id}`, data).then(unwrapData);

// UPDATE status
export const updateResourceStatus = (id, data) =>
    api.patch(`/resources/${id}/status`, data).then(unwrapData);

// DELETE
export const deleteResource = (id) => api.delete(`/resources/${id}`).then(unwrapData);
