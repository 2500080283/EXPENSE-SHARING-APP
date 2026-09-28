// Initial seed data for ShareWise Expense Sharing Platform

export const INITIAL_USERS = [
  {
    id: "usr_1",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 234-5678",
    paymentHandle: "alex@venmo",
    status: "active",
    joinedDate: "2025-11-10",
  },
  {
    id: "usr_2",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 345-6789",
    paymentHandle: "sarahchen@paypal",
    status: "active",
    joinedDate: "2025-11-12",
  },
  {
    id: "usr_3",
    name: "David Miller",
    email: "david.m@example.com",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 456-7890",
    paymentHandle: "david.miller@upi",
    status: "active",
    joinedDate: "2025-11-15",
  },
  {
    id: "usr_4",
    name: "Elena Rostova",
    email: "elena.r@example.com",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 567-8901",
    paymentHandle: "elena@revolut",
    status: "active",
    joinedDate: "2025-12-01",
  },
  {
    id: "usr_5",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 678-9012",
    paymentHandle: "priya.s@gpay",
    status: "active",
    joinedDate: "2026-01-05",
  },
  {
    id: "usr_admin",
    name: "Marcus Vance (Admin)",
    email: "admin@sharewise.internal",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 999-0000",
    paymentHandle: "admin@treasury",
    status: "active",
    joinedDate: "2025-10-01",
  }
];

export const INITIAL_CATEGORIES = [
  { id: "groceries", name: "Groceries & Supermarket", icon: "ShoppingCart", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  { id: "rent", name: "Rent & Housing", icon: "Home", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)" },
  { id: "dining", name: "Restaurants & Dining", icon: "Utensils", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  { id: "utilities", name: "Utilities & Bills", icon: "Zap", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)" },
  { id: "travel", name: "Travel & Transport", icon: "Plane", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" },
  { id: "entertainment", name: "Entertainment & Fun", icon: "Film", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
  { id: "shopping", name: "Supplies & Shopping", icon: "ShoppingBag", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
  { id: "health", name: "Medical & Health", icon: "HeartPulse", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  { id: "other", name: "General / Other", icon: "Tag", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)" }
];

export const INITIAL_GROUPS = [
  {
    id: "grp_1",
    name: "Apartment 402 Roommates",
    description: "Monthly rent, electricity, high-speed WiFi, cleaning supplies & bulk groceries",
    type: "apartment",
    icon: "Home",
    currency: "USD",
    members: ["usr_1", "usr_2", "usr_3"],
    createdBy: "usr_1",
    createdAt: "2026-01-10",
    archived: false
  },
  {
    id: "grp_2",
    name: "Euro Summer 2026 Trip",
    description: "Airbnb rentals, train passes, dinners in Paris, Florence museum passes",
    type: "trip",
    icon: "Plane",
    currency: "USD",
    members: ["usr_1", "usr_2", "usr_4", "usr_5"],
    createdBy: "usr_2",
    createdAt: "2026-02-01",
    archived: false
  },
  {
    id: "grp_3",
    name: "Weekend Goa Beach Getaway",
    description: "Villa booking, beachside seafood shacks, scooter rentals and fuel",
    type: "trip",
    icon: "Palmtree",
    currency: "USD",
    members: ["usr_1", "usr_3", "usr_5"],
    createdBy: "usr_3",
    createdAt: "2026-02-18",
    archived: false
  },
  {
    id: "grp_4",
    name: "Weekend Foodies Club",
    description: "Weekly potlucks, sushi nights, brunch spots and coffee crawls",
    type: "dining",
    icon: "Utensils",
    currency: "USD",
    members: ["usr_2", "usr_3", "usr_4"],
    createdBy: "usr_4",
    createdAt: "2026-03-01",
    archived: false
  }
];

export const INITIAL_EXPENSES = [
  {
    id: "exp_1",
    groupId: "grp_1",
    description: "March High-Speed Fiber Internet & Utilities",
    amount: 120.00,
    currency: "USD",
    date: "2026-03-01",
    category: "utilities",
    paidBy: "usr_1",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 40.00, share: 1, percentage: 33.33 },
      { userId: "usr_2", amount: 40.00, share: 1, percentage: 33.33 },
      { userId: "usr_3", amount: 40.00, share: 1, percentage: 33.34 }
    ],
    notes: "Gigabit connection bill paid via AutoPay",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-01T10:15:00Z"
  },
  {
    id: "exp_2",
    groupId: "grp_1",
    description: "Trader Joe's Bulk Groceries & Kitchen Supplies",
    amount: 186.40,
    currency: "USD",
    date: "2026-03-04",
    category: "groceries",
    paidBy: "usr_2",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 62.13, share: 1, percentage: 33.33 },
      { userId: "usr_2", amount: 62.13, share: 1, percentage: 33.33 },
      { userId: "usr_3", amount: 62.14, share: 1, percentage: 33.34 }
    ],
    notes: "Oat milk, olive oil, coffee beans, detergents and fresh veggies",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-04T16:30:00Z"
  },
  {
    id: "exp_3",
    groupId: "grp_1",
    description: "Living Room Air Purifier Replacement Filters",
    amount: 65.00,
    currency: "USD",
    date: "2026-03-08",
    category: "shopping",
    paidBy: "usr_3",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 21.66, share: 1, percentage: 33.33 },
      { userId: "usr_2", amount: 21.66, share: 1, percentage: 33.33 },
      { userId: "usr_3", amount: 21.68, share: 1, percentage: 33.34 }
    ],
    notes: "HEPA 3-stage filters on Amazon Prime",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-08T11:00:00Z"
  },
  {
    id: "exp_4",
    groupId: "grp_2",
    description: "Florence Heritage Airbnb Deposit (4 Nights)",
    amount: 640.00,
    currency: "USD",
    date: "2026-03-10",
    category: "travel",
    paidBy: "usr_2",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 160.00, share: 1, percentage: 25 },
      { userId: "usr_2", amount: 160.00, share: 1, percentage: 25 },
      { userId: "usr_4", amount: 160.00, share: 1, percentage: 25 },
      { userId: "usr_5", amount: 160.00, share: 1, percentage: 25 }
    ],
    notes: "Stunning central location near Duomo with terrace",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-10T14:20:00Z"
  },
  {
    id: "exp_5",
    groupId: "grp_2",
    description: "High-Speed TGV Train Tickets (Paris to Nice)",
    amount: 320.00,
    currency: "USD",
    date: "2026-03-14",
    category: "travel",
    paidBy: "usr_1",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 80.00, share: 1, percentage: 25 },
      { userId: "usr_2", amount: 80.00, share: 1, percentage: 25 },
      { userId: "usr_4", amount: 80.00, share: 1, percentage: 25 },
      { userId: "usr_5", amount: 80.00, share: 1, percentage: 25 }
    ],
    notes: "First class group reservation booked through SNCF",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-14T09:45:00Z"
  },
  {
    id: "exp_6",
    groupId: "grp_3",
    description: "Candolim Beach Villa Advance Payment",
    amount: 450.00,
    currency: "USD",
    date: "2026-03-18",
    category: "travel",
    paidBy: "usr_3",
    splitType: "percentage",
    splits: [
      { userId: "usr_1", amount: 180.00, share: 0, percentage: 40 },
      { userId: "usr_3", amount: 135.00, share: 0, percentage: 30 },
      { userId: "usr_5", amount: 135.00, share: 0, percentage: 30 }
    ],
    notes: "Master bedroom suite allocated to Alex, private pool villa",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-18T18:10:00Z"
  },
  {
    id: "exp_7",
    groupId: "grp_4",
    description: "Omakase Sushi Tasting Dinner",
    amount: 285.00,
    currency: "USD",
    date: "2026-03-22",
    category: "dining",
    paidBy: "usr_4",
    splitType: "exact",
    splits: [
      { userId: "usr_2", amount: 95.00, share: 0, percentage: 33.33 },
      { userId: "usr_3", amount: 90.00, share: 0, percentage: 31.57 },
      { userId: "usr_4", amount: 100.00, share: 0, percentage: 35.10 }
    ],
    notes: "Chef special tasting menu + matcha desserts",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-22T21:40:00Z"
  },
  {
    id: "exp_8",
    groupId: null, // Direct 1-on-1 split between Alex and David
    description: "Concert Tickets: Coldplay Music of the Spheres",
    amount: 190.00,
    currency: "USD",
    date: "2026-03-24",
    category: "entertainment",
    paidBy: "usr_1",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 95.00, share: 1, percentage: 50 },
      { userId: "usr_3", amount: 95.00, share: 1, percentage: 50 }
    ],
    notes: "Two seated tickets section 104",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-24T12:00:00Z"
  },
  {
    id: "exp_9",
    groupId: "grp_1",
    description: "Organic Coffee Subscription & Espresso Beans",
    amount: 48.00,
    currency: "USD",
    date: "2026-03-25",
    category: "groceries",
    paidBy: "usr_1",
    splitType: "equal",
    splits: [
      { userId: "usr_1", amount: 16.00, share: 1, percentage: 33.33 },
      { userId: "usr_2", amount: 16.00, share: 1, percentage: 33.33 },
      { userId: "usr_3", amount: 16.00, share: 1, percentage: 33.34 }
    ],
    notes: "Ethiopian Yirgacheffe medium roast 2kg bag",
    receiptUrl: "",
    status: "active",
    createdAt: "2026-03-25T08:15:00Z"
  }
];

export const INITIAL_SETTLEMENTS = [
  {
    id: "stl_1",
    groupId: "grp_1",
    fromUserId: "usr_1",
    toUserId: "usr_2",
    amount: 50.00,
    currency: "USD",
    date: "2026-03-05",
    paymentMethod: "Venmo",
    notes: "Partial payment for Trader Joe groceries",
    status: "completed",
    createdAt: "2026-03-05T17:00:00Z"
  },
  {
    id: "stl_2",
    groupId: "grp_2",
    fromUserId: "usr_4",
    toUserId: "usr_2",
    amount: 160.00,
    currency: "USD",
    date: "2026-03-12",
    paymentMethod: "Revolut",
    notes: "Florence Airbnb share settled in full",
    status: "completed",
    createdAt: "2026-03-12T19:30:00Z"
  }
];

export const INITIAL_REMINDERS = [
  {
    id: "rem_1",
    fromUserId: "usr_2",
    toUserId: "usr_3",
    groupId: "grp_1",
    amount: 62.14,
    message: "Hey David! Just a gentle nudge for your share of last week's Trader Joe's grocery haul ($62.14). Thanks!",
    channel: "in-app",
    status: "sent",
    sentAt: "2026-03-07T10:00:00Z"
  },
  {
    id: "rem_2",
    fromUserId: "usr_1",
    toUserId: "usr_3",
    groupId: null,
    amount: 95.00,
    message: "Hi David, friendly reminder for the Coldplay concert ticket ($95.00). Settle up whenever you can!",
    channel: "whatsapp",
    status: "sent",
    sentAt: "2026-03-26T14:20:00Z"
  }
];

export const INITIAL_DISPUTES = [
  {
    id: "dsp_1",
    expenseId: "exp_6",
    reportedBy: "usr_5",
    reason: "Discrepancy in villa percentage split: Priya wasn't aware of the 30% ratio vs equal split.",
    status: "under_review",
    resolutionNotes: "Admin reviewing booking terms and agreement between members.",
    resolvedBy: null,
    createdAt: "2026-03-20T11:45:00Z"
  }
];

export const INITIAL_PLATFORM_SETTINGS = {
  appName: "ShareWise",
  defaultCurrency: "USD",
  supportedCurrencies: ["USD", "EUR", "INR", "GBP", "CAD", "AUD"],
  simplifyDebtsDefault: true,
  maxGroupSize: 50,
  reminderCooldownHours: 24,
  autoReminderDays: 7,
  maintenanceMode: false
};
