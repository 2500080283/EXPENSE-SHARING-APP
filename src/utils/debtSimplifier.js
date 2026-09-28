/**
 * ShareWise Debt Simplifier
 * Implements greedy min-cash-flow algorithm to reduce complex pairwise debts
 * into the minimum possible number of payment transfers.
 */

/**
 * Calculates net balance for every user from a list of expenses and settlements.
 * Positive balance = user is owed money (creditor)
 * Negative balance = user owes money (debtor)
 * Zero = user is completely squared away
 */
export function calculateNetBalances(members, expenses, settlements = []) {
  const netBalances = {};

  // Initialize for all members
  members.forEach(memberId => {
    netBalances[memberId] = 0;
  });

  // Process Expenses
  expenses.forEach(expense => {
    if (expense.status === "cancelled") return;

    const payer = expense.paidBy;
    const amount = Number(expense.amount) || 0;

    // Credit payer
    if (netBalances[payer] !== undefined) {
      netBalances[payer] += amount;
    }

    // Debit each person who owes a split
    if (Array.isArray(expense.splits)) {
      expense.splits.forEach(split => {
        const splitUserId = split.userId;
        const splitAmount = Number(split.amount) || 0;
        if (netBalances[splitUserId] !== undefined) {
          netBalances[splitUserId] -= splitAmount;
        }
      });
    }
  });

  // Process Settlements (recorded direct payments)
  settlements.forEach(settlement => {
    if (settlement.status !== "completed") return;

    const fromUser = settlement.fromUserId;
    const toUser = settlement.toUserId;
    const amount = Number(settlement.amount) || 0;

    // fromUser paid money, reducing their debt (or increasing their credit)
    if (netBalances[fromUser] !== undefined) {
      netBalances[fromUser] += amount;
    }
    // toUser received money, reducing what was owed to them
    if (netBalances[toUser] !== undefined) {
      netBalances[toUser] -= amount;
    }
  });

  // Round to 2 decimal places to avoid floating point inaccuracies
  Object.keys(netBalances).forEach(key => {
    netBalances[key] = Math.round(netBalances[key] * 100) / 100;
  });

  return netBalances;
}

/**
 * Calculates raw pairwise debts (without simplification)
 * Shows who owes whom based directly on each individual expense and settlement.
 */
export function calculatePairwiseDebts(members, expenses, settlements = []) {
  // matrix[debtor][creditor] = amount
  const matrix = {};
  members.forEach(m1 => {
    matrix[m1] = {};
    members.forEach(m2 => {
      matrix[m1][m2] = 0;
    });
  });

  // Add debts from expenses
  expenses.forEach(exp => {
    if (exp.status === "cancelled") return;
    const payer = exp.paidBy;
    if (!matrix[payer]) return;

    if (Array.isArray(exp.splits)) {
      exp.splits.forEach(split => {
        const debtor = split.userId;
        if (debtor !== payer && matrix[debtor] && matrix[debtor][payer] !== undefined) {
          matrix[debtor][payer] += Number(split.amount) || 0;
        }
      });
    }
  });

  // Subtract settlements
  settlements.forEach(stl => {
    if (stl.status !== "completed") return;
    const from = stl.fromUserId;
    const to = stl.toUserId;
    const amount = Number(stl.amount) || 0;
    if (matrix[from] && matrix[from][to] !== undefined) {
      matrix[from][to] -= amount;
    }
  });

  // Consolidate bidirectional debts (if A owes B $50 and B owes A $20 -> A owes B $30)
  const results = [];
  const visited = new Set();

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const u1 = members[i];
      const u2 = members[j];
      const debt1To2 = matrix[u1][u2] || 0;
      const debt2To1 = matrix[u2][u1] || 0;
      const net = Math.round((debt1To2 - debt2To1) * 100) / 100;

      if (net > 0.01) {
        results.push({
          from: u1,
          to: u2,
          amount: net
        });
      } else if (net < -0.01) {
        results.push({
          from: u2,
          to: u1,
          amount: Math.abs(net)
        });
      }
    }
  }

  return results;
}

/**
 * Greedily simplifies debts to minimize total transactions across the entire group.
 * Returns an array of: { from: userId, to: userId, amount: number }
 */
export function simplifyDebts(netBalances) {
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    const val = Math.round(balance * 100) / 100;
    if (val < -0.01) {
      debtors.push({ userId, amount: -val }); // positive amount representing debt
    } else if (val > 0.01) {
      creditors.push({ userId, amount: val });
    }
  });

  // Sort descending by magnitude
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settled = Math.min(debtor.amount, creditor.amount);
    const roundedSettled = Math.round(settled * 100) / 100;

    if (roundedSettled > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundedSettled
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return transactions;
}
