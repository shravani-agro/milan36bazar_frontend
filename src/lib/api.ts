import axios from "axios";

const API_BASE = "https://184.168.125.61";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const realApi = {
  auth: {
    getSession: async () => {
      try {
        const res = await api.get("/auth/session");
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: { session: null }, error: err.response?.data || { message: err.message } };
      }
    },
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      try {
        const res = await api.post("/auth/login", { email, password });
        return { data: res.data, error: res.data.error };
      } catch (err: any) {
        return { data: { session: null }, error: err.response?.data || { message: err.message } };
      }
    },
    signOut: async () => {
      try {
        await api.post("/auth/logout");
        return { error: null };
      } catch (err: any) {
        return { error: err.response?.data || { message: err.message } };
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mocking subscription for now
      return {
        data: {
          subscription: {
            unsubscribe: () => { },
          },
        },
      };
    },
  },

  db: {
    getAll: async () => {
      try {
        const res = await api.get("/api/all");
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: null, error: err.response?.data || { message: err.message } };
      }
    },
    insert: async (table: string, item: any) => {
      try {
        let endpoint = `/api/${table}`;
        if (table === "app_users") endpoint = "/api/create/users";
        if (table === "markets") endpoint = "/api/create/markets";

        const res = await api.post(endpoint, item);
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: null, error: err.response?.data || { message: err.message } };
      }
    },
    update: async (table: string, id: string, payload: any) => {
      try {
        const res = await api.patch(`/api/${table}/${id}`, payload);
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: null, error: err.response?.data || { message: err.message } };
      }
    },
    delete: async (table: string, id: string | number) => {
      try {
        await api.delete(`/api/${table}/${id}`);
        return { error: null };
      } catch (err: any) {
        return { error: err.response?.data || { message: err.message } };
      }
    },
    declareResult: async (payload: any) => {
      try {
        const res = await api.post("/api/create/result", payload);
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: null, error: err.response?.data || { message: err.message } };
      }
    },
  },
};
