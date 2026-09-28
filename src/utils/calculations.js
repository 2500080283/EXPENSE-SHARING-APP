/**
 * Financial split and aggregation calculations
 */

export function computeSplits({ amount, splitType, selectedMembers, customInputs = {} }) {
  const total = Number(amount) || 0;
  if (!selectedMembers || selectedMembers.length === 0 || total <= 0) {
    return [];
  }

  const n = selectedMembers.length;

  if (splitType === "equal") {
    const rawShare = total / n;
    let distributed = 0;
    const splits = selectedMembers.map((memberId, idx) => {
      // Round to 2 decimals
      let share = Math.round(rawShare * 100) / 100;
      if (idx === n - 1) {
        // Adjust last member for penny precision rounding differences
        share = Math.round((total - distributed) * 100) / 100;
      } else {
        distributed += share;
      }
      return {
        userId: memberId,
        amount: share,
        share: 1,
        percentage: Math.round((share / total) * 10000) / 100
      };
    });
    return splits;
  }

  if (splitType === "percentage") {
    let distributed = 0;
    const splits = selectedMembers.map((memberId, idx) => {
      const pct = Number(customInputs[memberId]) || 0;
      let share = Math.round((total * (pct / 100)) * 100) / 100;
      if (idx === n - 1) {
        share = Math.round((total - distributed) * 100) / 100;
      } else {
        distributed += share;
      }
      return {
        userId: memberId,
        amount: share,
        share: 0,
        percentage: pct
      };
    });
    return splits;
  }

  if (splitType === "shares") {
    let totalShares = 0;
    selectedMembers.forEach(id => {
      totalShares += Number(customInputs[id]) || 1;
    });
    if (totalShares <= 0) totalShares = n;

    let distributed = 0;
    const splits = selectedMembers.map((memberId, idx) => {
      const s = Number(customInputs[memberId]) || 1;
      let share = Math.round((total * (s / totalShares)) * 100) / 100;
      if (idx === n - 1) {
        share = Math.round((total - distributed) * 100) / 100;
      } else {
        distributed += share;
      }
      return {
        userId: memberId,
        amount: share,
        share: s,
        percentage: Math.round((share / total) * 10000) / 100
      };
    });
    return splits;
  }

  if (splitType === "exact") {
    return selectedMembers.map(memberId => {
      const exactAmt = Number(customInputs[memberId]) || 0;
      return {
        userId: memberId,
        amount: exactAmt,
        share: 0,
        percentage: total > 0 ? Math.round((exactAmt / total) * 10000) / 100 : 0
      };
    });
  }

  // Fallback
  return selectedMembers.map(m => ({ userId: m, amount: total / n, share: 1, percentage: 100 / n }));
}

/**
 * Calculates a specific user's total owed, total owes, and net balance across all activities or within a specific group.
 */
export function getUserFinancialOverview(userId, expenses, settlements = [], groupId = null) {
  let relevantExpenses = expenses;
  let relevantSettlements = settlements;

  if (groupId) {
    relevantExpenses = expenses.filter(e => e.groupId === groupId);
    relevantSettlements = settlements.filter(s => s.groupId === groupId);
  }

  let totalPaidByMe = 0;
  let totalMyShare = 0;
  let settledReceived = 0;
  let settledPaid = 0;

  relevantExpenses.forEach(exp => {
    if (exp.status === "cancelled") return;

    if (exp.paidBy === userId) {
      totalPaidByMe += Number(exp.amount) || 0;
    }

    if (Array.isArray(exp.splits)) {
      const mySplit = exp.splits.find(s => s.userId === userId);
      if (mySplit) {
        totalMyShare += Number(mySplit.amount) || 0;
      }
    }
  });

  relevantSettlements.forEach(stl => {
    if (stl.status !== "completed") return;

    if (stl.fromUserId === userId) {
      settledPaid += Number(stl.amount) || 0;
    }
    if (stl.toUserId === userId) {
      settledReceived += Number(stl.amount) || 0;
    }
  });

  // Net = (What I paid - What I owe from splits) + (What I paid in settlements - What I received in settlements)
  const net = (totalPaidByMe - totalMyShare) + (settledPaid - settledReceived);
  const roundedNet = Math.round(net * 100) / 100;

  // Now calculate total others owe me vs total I owe others pairwise
  // We can evaluate pairwise relationships
  return {
    netBalance: roundedNet,
    totalPaidByMe: Math.round(totalPaidByMe * 100) / 100,
    totalMyShare: Math.round(totalMyShare * 100) / 100,
    settledPaid: Math.round(settledPaid * 100) / 100,
    settledReceived: Math.round(settledReceived * 100) / 100
  };
}

/**
 * Computes pairwise balances between the active user and each other user across all expenses and settlements
 */
export function getUserPairwiseBalances(activeUserId, allUsers, expenses, settlements = []) {
  const balances = {}; // { [otherUserId]: netAmount }
  // positive = otherUser owes activeUser
  // negative = activeUser owes otherUser

  allUsers.forEach(u => {
    if (u.id !== activeUserId) {
      balances[u.id] = 0;
    }
  });

  expenses.forEach(exp => {
    if (exp.status === "cancelled") return;

    // Case 1: activeUser paid
    if (exp.paidBy === activeUserId && Array.isArray(exp.splits)) {
      exp.splits.forEach(split => {
        if (split.userId !== activeUserId && balances[split.userId] !== undefined) {
          balances[split.userId] += Number(split.amount) || 0;
        }
      });
    }

    // Case 2: Someone else paid, and activeUser owes
    if (exp.paidBy !== activeUserId && Array.isArray(exp.splits)) {
      const mySplit = exp.splits.find(s => s.userId === activeUserId);
      if (mySplit && balances[exp.paidBy] !== undefined) {
        balances[exp.paidBy] -= Number(mySplit.amount) || 0;
      }
    }
  });

  // Adjust for settlements
  settlements.forEach(stl => {
    if (stl.status !== "completed") return;

    // If activeUser paid someone, their debt to that person decreases (balance increases)
    if (stl.fromUserId === activeUserId && balances[stl.toUserId] !== undefined) {
      balances[stl.toUserId] += Number(stl.amount) || 0;
    }
    // If someone paid activeUser, that person owes activeUser less (balance decreases)
    if (stl.toUserId === activeUserId && balances[stl.fromUserId] !== undefined) {
      balances[stl.fromUserId] -= Number(stl.amount) || 0;
    }
  });

  // Convert to structured list
  let totalYouAreOwed = 0;
  let totalYouOwe = 0;

  const friends = allUsers
    .filter(u => u.id !== activeUserId)
    .map(user => {
      const balance = Math.round((balances[user.id] || 0) * 100) / 100;
      if (balance > 0.01) {
        totalYouAreOwed += balance;
      } else if (balance < -0.01) {
        totalYouOwe += Math.abs(balance);
      }
      return {
        user,
        balance,
        status: balance > 0.01 ? "owed_to_you" : balance < -0.01 ? "you_owe" : "settled"
      };
    });

  return {
    friends,
    totalYouAreOwed: Math.round(totalYouAreOwed * 100) / 100,
    totalYouOwe: Math.round(totalYouOwe * 100) / 100,
    netTotal: Math.round((totalYouAreOwed - totalYouOwe) * 100) / 100
  };
}

/**
 * Breakdown of spending by category for analytics
 */
export function getCategorySpendingBreakdown(expenses, categories) {
  const totals = {};
  categories.forEach(c => {
    totals[c.id] = 0;
  });

  let grandTotal = 0;

  expenses.forEach(exp => {
    if (exp.status === "cancelled") return;
    const cat = exp.category || "other";
    const amt = Number(exp.amount) || 0;
    totals[cat] = (totals[cat] || 0) + amt;
    grandTotal += amt;
  });

  return categories.map(cat => {
    const amount = Math.round((totals[cat.id] || 0) * 100) / 100;
    const percentage = grandTotal > 0 ? Math.round((amount / grandTotal) * 1000) / 10 : 0;
    return {
      ...cat,
      amount,
      percentage
    };
  }).filter(c => c.amount > 0 || c.id === "groceries" || c.id === "dining" || c.id === "travel");
}
