import { apiClient } from "@/lib/api-client";
import { mockApi, type Complaint } from "@/lib/mock-api";
import { mockComplaintToApi } from "@/lib/complaint-utils";

const SEVERITY_MAP = {
  low: "Minor",
  medium: "Moderate",
  high: "Critical",
} as const;

export interface ReportInput {
  title: string;
  description: string;
  type: string;
  severity: "low" | "medium" | "high";
  location_lat: number;
  location_lon: number;
  image_url?: string;
  user_id: string;
}

export async function submitReport(input: ReportInput): Promise<Complaint> {
  const apiSeverity = SEVERITY_MAP[input.severity];
  const created = await apiClient.createComplaint({
    issue_type: input.type,
    severity: apiSeverity,
    latitude: input.location_lat,
    longitude: input.location_lon,
    address: input.title,
    photo_url: input.image_url,
  });

  if (created) {
    return {
      id: created.id,
      user_id: input.user_id,
      title: input.title,
      description: input.description,
      type: input.type,
      severity: input.severity,
      location_lat: input.location_lat,
      location_lon: input.location_lon,
      status: "pending",
      image_url: input.image_url,
      created_at: created.created_at,
      upvotes: 1,
      assigned_engineer: "Auto-assigned Engineer",
    };
  }

  return mockApi.createComplaint(input);
}

export { mockComplaintToApi };
