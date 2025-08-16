import axios from "axios";
import { AxiosInstance } from "axios";

// Use the environment variable directly for the API base URL

class API {
  private instance: AxiosInstance;
  private publicInstance: AxiosInstance;

  constructor() {
    // Authenticated instance for protected routes
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    // Public instance for authentication-related requests
    this.publicInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    this.setInterceptor();
  }

  setInterceptor() {
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          // Dynamically import Clerk client utility to avoid server-side bundling issues
          if (typeof window !== "undefined") {
            const clerk = await import("@clerk/nextjs");
            // getToken may be undefined if Clerk isn't initialized; guard it
            const getToken = (clerk as any).getToken;
            if (typeof getToken === "function") {
              const token = await getToken();
              if (token) {
                config.headers = {
                  ...(config.headers || {}),
                  Authorization: `Bearer ${token}`,
                };
              }
            }
          }
        } catch (e) {
          // if token retrieval fails, proceed without token — individual requests can handle 401s
          // console.debug("Clerk token attach failed:", e);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getTaxonomy() {
    const response = await this.publicInstance.get("/api/taxonomy");
    return response.data;
  }

  async getSessions() {
    const response = await this.instance.get("/api/sessions");
    return response.data;
  }

  async createSession(session: any) {
    const response = await this.instance.post("/api/sessions", session);
    return response.data;
  }

  async getSession(id: string) {
    const response = await this.instance.get(`/api/sessions/${id}`);
    return response.data;
  }

  async submitSession(id: string, session: any) {
    const response = await this.instance.post(
      `/api/sessions/${id}/submit`,
      session
    );
    return response.data;
  }

  async getAdminAnalytics() {
    const response = await this.instance.get("/api/admin/analytics");
    return response.data;
  }

  async getAdminSessions() {
    const response = await this.instance.get("/api/admin/sessions");
    return response.data;
  }

  async getAdminSession(id: string) {
    const response = await this.instance.get(`/api/admin/sessions/${id}`);
    return response.data;
  }

  async getAdminSessionResults(id: string) {
    const response = await this.instance.get(
      `/api/admin/sessions/${id}/results`
    );
    return response.data;
  }
}

const Api = new API();
export default Api;
