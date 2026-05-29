import type { Complaint } from "@/lib/mock-api";
import { mockComplaintToApi } from "@/lib/complaint-utils";

export const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) ||
  "http://localhost:3000";

export interface ApiComplaint {
  id: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  address: string;
  issue_type: string;
  severity: "Critical" | "Moderate" | "Minor";
  status: "Reported" | "In Progress" | "Resolved";
  created_at: string;
}

export interface ApiProject {
  road_name: string;
  contractor_name: string;
  allocated_amount: number;
  used_amount?: number;
  deadline: string;
  status: string;
}

export interface CreateComplaintPayload {
  issue_type: string;
  severity: "Critical" | "Moderate" | "Minor";
  latitude: number;
  longitude: number;
  address: string;
  photo_url?: string;
  status?: "Reported";
}

export const apiClient = {
  getComplaints: async (fallback?: Complaint[]): Promise<ApiComplaint[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/complaints`);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data: ApiComplaint[] = await res.json();
      if (data.length > 0) return data;
      return fallback?.map(mockComplaintToApi) ?? [];
    } catch (e) {
      console.error("Error fetching complaints:", e);
      return fallback?.map(mockComplaintToApi) ?? [];
    }
  },

  updateComplaintStatus: async (id: string, status: string): Promise<ApiComplaint | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    } catch (e) {
      console.error("Error updating complaint status:", e);
      return null;
    }
  },

  getSpending: async (pincode: string): Promise<ApiProject[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/spending/${pincode}`);
      if (!res.ok) throw new Error("Failed to fetch spending data");
      return await res.json();
    } catch (e) {
      console.error("Error fetching spending data:", e);
      return [];
    }
  },

  createComplaint: async (payload: CreateComplaintPayload): Promise<ApiComplaint | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: payload.status ?? "Reported" }),
      });
      if (!res.ok) throw new Error("Failed to create complaint");
      return await res.json();
    } catch (e) {
      console.error("Error creating complaint:", e);
      return null;
    }
  },
};
