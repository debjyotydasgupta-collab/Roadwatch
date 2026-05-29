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
  // Two-Wheeler specific
  { id: "tl1", region: "IN", violation: "Driving without Helmet", vehicle_type: "Two-Wheeler", fine_amount: 1000, consequence: "3-month license disqualification" },
  { id: "tl2", region: "IN", violation: "Triple Riding (Overloading)", vehicle_type: "Two-Wheeler", fine_amount: 2000, consequence: "3-month license disqualification" },
  
  // Car / LMV specific
  { id: "tl3", region: "IN", violation: "Driving without Seat Belt", vehicle_type: "Car", fine_amount: 1000, consequence: "Challan issued" },
  { id: "tl4", region: "IN", violation: "Over-speeding (Light Motor Vehicle)", vehicle_type: "Car", fine_amount: 2000, consequence: "Challan issued; possible license suspension" },
  
  // Commercial specific
  { id: "tl5", region: "IN", violation: "Over-speeding (Medium/Heavy Vehicle)", vehicle_type: "Commercial", fine_amount: 4000, consequence: "Challan issued; possible license suspension" },
  { id: "tl6", region: "IN", violation: "Overloading of Goods Vehicle", vehicle_type: "Commercial", fine_amount: 20000, consequence: "+ ₹2,000 per extra ton" },
  { id: "tl7", region: "IN", violation: "Overloading of Passengers", vehicle_type: "Commercial", fine_amount: 1000, consequence: "Per extra passenger" },
  { id: "tl8", region: "IN", violation: "Vehicles not having a permit", vehicle_type: "Commercial", fine_amount: 10000, consequence: "Vehicle may be impounded" },
  
  // All Vehicles (General)
  { id: "tl9", region: "IN", violation: "Driving without a License", vehicle_type: "All", fine_amount: 5000, consequence: "Vehicle may be impounded" },
  { id: "tl10", region: "IN", violation: "Driving despite Disqualification", vehicle_type: "All", fine_amount: 10000, consequence: "Vehicle impounded" },
  { id: "tl11", region: "IN", violation: "Drunk Driving", vehicle_type: "All", fine_amount: 10000, consequence: "Up to 6 months imprisonment" },
  { id: "tl12", region: "IN", violation: "Dangerous Driving / Jumping Red Light", vehicle_type: "All", fine_amount: 5000, consequence: "Up to 1 year imprisonment" },
  { id: "tl13", region: "IN", violation: "Racing and Speed Testing", vehicle_type: "All", fine_amount: 5000, consequence: "License suspension" },
  { id: "tl14", region: "IN", violation: "Not giving way to Emergency Vehicles", vehicle_type: "All", fine_amount: 10000, consequence: "Challan issued" },
  { id: "tl15", region: "IN", violation: "Driving without Insurance", vehicle_type: "All", fine_amount: 2000, consequence: "Up to 3 months imprisonment" },
  { id: "tl16", region: "IN", violation: "Driving Unregistered Vehicle", vehicle_type: "All", fine_amount: 5000, consequence: "₹10,000 for subsequent offenses" },
  { id: "tl17", region: "IN", violation: "Using Mobile Phone while Driving", vehicle_type: "All", fine_amount: 5000, consequence: "Challan issued" },
  { id: "tl18", region: "IN", violation: "Offenses by Juveniles", vehicle_type: "All", fine_amount: 25000, consequence: "3 yrs jail to guardian + vehicle impounded" },

  // US Region Fallbacks
  { id: "us1", region: "US", violation: "Speeding (1-10 mph over)", vehicle_type: "All", fine_amount: 150, consequence: "3 points on license" },
  { id: "us2", region: "US", violation: "DUI", vehicle_type: "All", fine_amount: 2500, consequence: "License suspension, mandatory court appearance" },
  { id: "us3", region: "US", violation: "Running a Red Light", vehicle_type: "All", fine_amount: 250, consequence: "2 points on license" }
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
      resolved: mockComplaints.filter((c) => c.status === "resolved" || c.status === "verified").length,
      pending: mockComplaints.filter((c) => c.status === "pending").length,
      pointsAwarded: mockUsers.reduce((acc, u) => acc + u.points, 0),
    };
  },

  getAnalyticsDetailed: async () => {
    await delay(400);
    const base = await mockApi.getAnalytics();
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    mockComplaints.forEach((c) => {
      byType[c.type] = (byType[c.type] ?? 0) + 1;
      bySeverity[c.severity] = (bySeverity[c.severity] ?? 0) + 1;
    });
    const categoryData = Object.entries(byType).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }));
    const severityData = [
      { name: "High", value: bySeverity.high ?? 0, color: "#ef4444" },
      { name: "Medium", value: bySeverity.medium ?? 0, color: "#f59e0b" },
      { name: "Low", value: bySeverity.low ?? 0, color: "#22c55e" },
    ].filter((d) => d.value > 0);
    const weeklyTrend = [
      { day: "Mon", reports: 4 },
      { day: "Tue", reports: 7 },
      { day: "Wed", reports: 5 },
      { day: "Thu", reports: 9 },
      { day: "Fri", reports: 6 },
      { day: "Sat", reports: 3 },
      { day: "Sun", reports: 2 },
    ];
    return { ...base, categoryData, severityData, weeklyTrend };
  },

  searchTrafficLaws: async (region: Region, query: string, vehicle?: string) => {
    const laws = await mockApi.getTrafficLaws(region);
    const q = query.toLowerCase().trim();
    return laws.filter((l) => {
      const matchVehicle =
        !vehicle || vehicle === "All" || l.vehicle_type === vehicle || l.vehicle_type === "All";
      const matchQuery =
        !q ||
        l.violation.toLowerCase().includes(q) ||
        l.consequence.toLowerCase().includes(q);
      return matchVehicle && matchQuery;
    });
  },
};
