import type { ApiComplaint } from "@/lib/api-client";
import type { Complaint } from "@/lib/mock-api";

export type ComplaintDisplay = {
  id: string;
  issue_type: string;
  severity: string;
  status: string;
  address?: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  created_at: string;
};

const MOCK_SEVERITY: Record<Complaint["severity"], ApiComplaint["severity"]> = {
  low: "Minor",
  medium: "Moderate",
  high: "Critical",
};

const MOCK_STATUS: Record<Complaint["status"], ApiComplaint["status"]> = {
  pending: "Reported",
  resolved: "In Progress",
  verified: "Resolved",
};

export function mockComplaintToApi(c: Complaint): ApiComplaint {
  return {
    id: c.id,
    photo_url: c.image_url,
    latitude: c.location_lat,
    longitude: c.location_lon,
    address: c.title,
    issue_type: c.type,
    severity: MOCK_SEVERITY[c.severity],
    status: MOCK_STATUS[c.status],
    created_at: c.created_at,
  };
}

export function normalizeComplaint(c: Complaint | ApiComplaint): ComplaintDisplay {
  if ("issue_type" in c) {
    return {
      id: c.id,
      issue_type: c.issue_type,
      severity: c.severity,
      status: c.status,
      address: c.address,
      latitude: c.latitude,
      longitude: c.longitude,
      photo_url: c.photo_url,
      created_at: c.created_at,
    };
  }

  return {
    id: c.id,
    issue_type: c.type,
    severity: MOCK_SEVERITY[c.severity],
    status: MOCK_STATUS[c.status],
    address: c.title,
    latitude: c.location_lat,
    longitude: c.location_lon,
    photo_url: c.image_url,
    created_at: c.created_at,
  };
}
