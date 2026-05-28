export type Role = "citizen" | "authority";
export type Region = "IN" | "US";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
}

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  severity: "low" | "medium" | "high";
  location_lat: number;
  location_lon: number;
  status: "pending" | "resolved" | "verified";
  image_url?: string;
  created_at: string;
  after_image_url?: string;
  upvotes: number;
  assigned_engineer?: string;
}

export interface RoadProject {
  id: string;
  name: string;
  road_type: "NH" | "SH" | "MDR" | "Local";
  last_relaying_date: string;
  budget_source: "Central" | "State" | "Municipal" | "Federal" | "Local Gov";
  contractor_name: string;
  budget_amount: number;
  used_amount: number;
  region: Region;
}

export interface TrafficLaw {
  id: string;
  region: Region;
  violation: string;
  vehicle_type: "Two-Wheeler" | "Car" | "Commercial" | "All";
  fine_amount: number;
  consequence: string;
}

// Mock Data
export let mockUsers: User[] = [
  { id: "u1", name: "Citizen Doe", email: "citizen@example.com", role: "citizen", points: 150 },
  { id: "u2", name: "Admin Officer", email: "admin@example.com", role: "authority", points: 0 },
];

let mockComplaints: Complaint[] = [
  {
    id: "c1",
    user_id: "u1",
    title: "Large Pothole on NH-44",
    description: "Deep pothole causing traffic slowdowns and potential damage to cars.",
    type: "pothole",
    severity: "high",
    location_lat: 12.9716,
    location_lon: 77.5946,
    status: "pending",
    created_at: new Date().toISOString(),
    upvotes: 12,
    assigned_engineer: "Er. Ramesh Kumar (NHAI)",
  },
  {
    id: "c2",
    user_id: "u1",
    title: "Waterlogging at Junction",
    description: "Severe waterlogging after recent rains.",
    type: "waterlogging",
    severity: "medium",
    location_lat: 12.9756,
    location_lon: 77.5906,
    status: "resolved",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    after_image_url: "mock-after-url",
    upvotes: 5,
    assigned_engineer: "Er. Sunita Verma (BBMP)",
  },
  {
    id: "c3",
    user_id: "u1",
    title: "Cracks on side road",
    description: "Minor cracks developing on the newly laid road.",
    type: "crack",
    severity: "low",
    location_lat: 12.9686,
    location_lon: 77.5986,
    status: "verified",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    after_image_url: "mock-after-url-2",
    upvotes: 2,
    assigned_engineer: "Local Ward Engineer",
  }
];

let mockProjects: RoadProject[] = [
  { 
    id: "p1", 
    name: "NH-44 Expansion", 
    road_type: "NH", 
    last_relaying_date: "2024-01-15",
    budget_source: "Central",
    contractor_name: "L&T Infrastructure", 
    budget_amount: 50000000, 
    used_amount: 45000000,
    region: "IN"
  },
  { 
    id: "p2", 
    name: "City Junction Drainage", 
    road_type: "MDR", 
    last_relaying_date: "2023-08-10",
    budget_source: "Municipal",
    contractor_name: "City Infra Builders", 
    budget_amount: 2000000, 
    used_amount: 500000,
    region: "IN"
  },
  { 
    id: "p3", 
    name: "I-95 Maintenance", 
    road_type: "NH", 
    last_relaying_date: "2024-03-20",
    budget_source: "Federal",
    contractor_name: "US Highway Corp", 
    budget_amount: 12000000, 
    used_amount: 9000000,
    region: "US"
  },
];

let mockTrafficLaws: TrafficLaw[] = [
  { id: "tl1", region: "IN", violation: "Speeding", vehicle_type: "Car", fine_amount: 2000, consequence: "License impounded for repeat offense" },
  { id: "tl2", region: "IN", violation: "Without Helmet", vehicle_type: "Two-Wheeler", fine_amount: 1000, consequence: "3-month license disqualification" },
  { id: "tl3", region: "IN", violation: "Drunk Driving", vehicle_type: "All", fine_amount: 10000, consequence: "Up to 6 months imprisonment" },
  { id: "tl4", region: "US", violation: "Speeding (1-10 mph over)", vehicle_type: "All", fine_amount: 150, consequence: "3 points on license" },
  { id: "tl5", region: "US", violation: "DUI", vehicle_type: "All", fine_amount: 2500, consequence: "License suspension, mandatory court appearance" },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  getComplaints: async () => {
    await delay(300);
    return [...mockComplaints].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  
  createComplaint: async (data: Omit<Complaint, "id" | "created_at" | "status" | "upvotes" | "assigned_engineer">) => {
    await delay(500);
    const newComplaint: Complaint = {
      ...data,
      id: "c" + Date.now(),
      status: "pending",
      created_at: new Date().toISOString(),
      upvotes: 1,
      assigned_engineer: "Auto-assigned Engineer",
    };
    mockComplaints.push(newComplaint);
    return newComplaint;
  },

  upvoteComplaint: async (id: string) => {
    await delay(200);
    const c = mockComplaints.find(c => c.id === id);
    if (c) {
      c.upvotes += 1;
      return c;
    }
    throw new Error("Not found");
  },

  updateComplaintStatus: async (id: string, status: "pending" | "resolved" | "verified", after_image_url?: string) => {
    await delay(400);
    const c = mockComplaints.find(c => c.id === id);
    if (c) {
      c.status = status;
      if (after_image_url) c.after_image_url = after_image_url;
      
      // Give points to user on verification
      if (status === "verified") {
        const u = mockUsers.find(user => user.id === c.user_id);
        if (u) u.points += 50;
      }
      return c;
    }
    throw new Error("Not found");
  },

  analyzeImage: async (image_url: string) => {
    await delay(1000);
    return { issueType: "pothole", severity: "high", description: "Deep pothole detected on asphalt road." };
  },

  getSpending: async (region: Region = "IN") => {
    await delay(400);
    return mockProjects.filter(p => p.region === region);
  },

  getTrafficLaws: async (region: Region = "IN") => {
    await delay(300);
    return mockTrafficLaws.filter(t => t.region === region);
  },

  chatResponse: async (message: string) => {
    await delay(1000);
    const lower = message.toLowerCase();
    if (lower.includes("pothole") || lower.includes("water") || lower.includes("crack")) {
      return "I've noted that issue. Could you please upload a photo and confirm the location so I can auto-route this to the correct Executive Engineer?";
    }
    return "Hello! I am the RoadWatch AI assistant. You can tell me about road issues, ask about public spending, or query traffic fines.";
  },

  getAnalytics: async () => {
    await delay(400);
    return {
      total: mockComplaints.length,
      resolved: mockComplaints.filter(c => c.status === "resolved" || c.status === "verified").length,
      pending: mockComplaints.filter(c => c.status === "pending").length,
      pointsAwarded: mockUsers.reduce((acc, u) => acc + u.points, 0)
    };
  }
};
