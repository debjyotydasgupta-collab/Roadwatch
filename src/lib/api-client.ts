import { mockApi, type Complaint, type RoadProject } from "@/lib/mock-api";
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

function mockProjectToApi(p: RoadProject): ApiProject {
  const usedRatio = p.used_amount / p.budget_amount;
  return {
    road_name: p.name,
    contractor_name: p.contractor_name,
    allocated_amount: p.budget_amount,
    used_amount: p.used_amount,
    deadline: p.last_relaying_date,
    status: usedRatio >= 0.95 ? "Completed" : usedRatio > 0 ? "In Progress" : "Tender Stage",
  };
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

import { searchProjectsForPincode } from "@/lib/ai.functions";

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
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (e) {
      console.error("Error fetching spending data from backend:", e);
    }

    try {
      // Fallback to Gemini web search
      const aiProjects = await searchProjectsForPincode({ data: { pincode } });
      if (aiProjects && aiProjects.length > 0) {
        return aiProjects.map(mockProjectToApi);
      }
    } catch (e) {
      console.error("Error from AI spending search:", e);
    }

    // Deterministic fallback based on pincode if Gemini is rate-limited
    const seed = parseInt(pincode, 10) || 110001;
    return [
      {
        road_name: `Infrastructure Upgrade Ward ${(seed % 50) + 1}`,
        contractor_name: (seed % 2 === 0) ? "NHAI" : "Local PWD",
        allocated_amount: (seed % 10 + 1) * 10000000,
        used_amount: (seed % 10 + 1) * 7500000,
        deadline: `202${5 + (seed % 3)}-12-31`,
        status: (seed % 3 === 0) ? "In Progress" : "Tender Stage",
      },
      {
        road_name: `Road Relaying Zone ${(seed % 20) + 1}`,
        contractor_name: "City Infra Builders",
        allocated_amount: (seed % 5 + 1) * 5000000,
        used_amount: (seed % 5 + 1) * 2000000,
        deadline: `202${4 + (seed % 3)}-06-30`,
        status: "In Progress",
      }
    ];
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

  authorityLogin: async (passcode: string): Promise<{ user: any } | { error: string }> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/authority`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        return { error: "Invalid passcode" };
      }
      return await res.json();
    } catch (e) {
      console.error("Error during authority login:", e);
      return { error: "Network error" };
    }
  },
};
