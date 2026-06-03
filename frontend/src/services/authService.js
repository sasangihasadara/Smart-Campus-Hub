import api from "./api";

export const registerUser = async (payload) => {
    const response = await api.post("/auth/register", payload);
    return response.data.data;
};

export const loginUser = async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data.data;
};

export const loginAdmin = async ({ email, password }) => {
    const response = await api.post("/auth/admin/login", { email, password });
    return response.data.data;
};

export const loginTechnician = async ({ email, password }) => {
    const response = await api.post("/auth/technician/login", { email, password });
    return response.data.data;
};

export const loginPortalUser = async ({ email, password }) => {
    const response = await api.post("/auth/user/login", { email, password });
    return response.data.data;
};

export const loginWithGoogleToken = async (idToken) => {
    const response = await api.post("/auth/google", { idToken });
    return response.data.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
};

export const updateCurrentUser = async (payload) => {
    const response = await api.put("/auth/me", payload);
    return response.data.data;
};

export const deleteCurrentUser = async () => {
    const response = await api.delete("/auth/me");
    return response.data;
};
