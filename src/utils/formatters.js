/**
 * Formatting helpers for currencies, dates, and CSV export
 */

export function formatCurrency(amount, currency = "USD") {
  const num = Number(amount) || 0;
  const absNum = Math.abs(num);

  const symbols = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$"
  };

  const symbol = symbols[currency] || "$";
  const formatted = absNum.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (num < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function exportExpensesToCSV(expenses, usersMap, groupsMap, categoriesMap) {
  const headers = [
    "Expense ID",
    "Date",
    "Description",
    "Category",
    "Group",
    "Total Amount",
    "Currency",
    "Paid By",
    "Split Details",
    "Notes",
    "Status"
  ];

  const rows = expenses.map(exp => {
    const payerName = usersMap[exp.paidBy]?.name || exp.paidBy;
    const groupName = exp.groupId ? (groupsMap[exp.groupId]?.name || "Group") : "Direct 1-on-1";
    const categoryName = categoriesMap[exp.category]?.name || exp.category;
    
    const splitsSummary = Array.isArray(exp.splits)
      ? exp.splits.map(s => `${usersMap[s.userId]?.name || s.userId}: $${s.amount}`).join("; ")
      : "";

    return [
      exp.id,
      exp.date,
      `"${(exp.description || "").replace(/"/g, '""')}"`,
      `"${categoryName}"`,
      `"${groupName}"`,
      exp.amount,
      exp.currency || "USD",
      `"${payerName}"`,
      `"${splitsSummary}"`,
      `"${(exp.notes || "").replace(/"/g, '""')}"`,
      exp.status || "active"
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sharewise_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
