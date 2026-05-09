import axios from "axios";

const isNetlify = typeof window !== "undefined" && window.location.hostname.includes("netlify.app");
const API_BASE = isNetlify ? "" : "http://184.168.125.61";
// const API_BASE = "http://localhost:8000";
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let authListeners: Array<(event: string, session: any) => void> = [];

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
        if (res.data.session) {
          authListeners.forEach((l) => l("SIGNED_IN", res.data.session));
        }
        return { data: res.data, error: res.data.error };
      } catch (err: any) {
        return { data: { session: null }, error: err.response?.data || { message: err.message } };
      }
    },
    signOut: async () => {
      try {
        await api.post("/auth/logout");
        authListeners.forEach((l) => l("SIGNED_OUT", null));
        return { error: null };
      } catch (err: any) {
        return { error: err.response?.data || { message: err.message } };
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authListeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners = authListeners.filter((l) => l !== callback);
            },
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
    getAllBids: async () => {
      try {
        const res = await api.get("/api/bids/all");
        return { data: res.data, error: null };
      } catch (err: any) {
        return { data: null, error: err.response?.data || { message: err.message } };
      }
    },
    getAggregatedBids: async (bidDate: string, marketId: string) => {
      try {
        const res = await api.get(`/api/bids/aggregated`, {
          params: { bid_date: bidDate, market_id: marketId },
        });
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
