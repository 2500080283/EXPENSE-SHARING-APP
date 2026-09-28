import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/Toast";
import AddExpenseModal from "./components/AddExpenseModal";
import SettleUpModal from "./components/SettleUpModal";
import SendReminderModal from "./components/SendReminderModal";
import CreateGroupModal from "./components/CreateGroupModal";
import DisputeModal from "./components/DisputeModal";
import NotificationDrawer from "./components/NotificationDrawer";

// User Module components
import UserDashboard from "./components/UserModule/UserDashboard";
import GroupsView from "./components/UserModule/GroupsView";
import GroupDetail from "./components/UserModule/GroupDetail";
import ExpenseHistory from "./components/UserModule/ExpenseHistory";
import FriendsView from "./components/UserModule/FriendsView";
import AnalyticsView from "./components/UserModule/AnalyticsView";

// Admin Module
import AdminDashboard from "./components/AdminModule/AdminDashboard";

// Storage
import { loadAppState, saveAppState, resetAppToDefaults } from "./utils/storage";

export default function App() {
  const [appState, setAppState] = useState(() => loadAppState());
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "groups", "expenses", "friends", "analytics"
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Modals state
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [preselectedGroupId, setPreselectedGroupId] = useState(null);

  const [settleUpModalOpen, setSettleUpModalOpen] = useState(false);
  const [settlePrefillData, setSettlePrefillData] = useState(null);

  const [sendReminderModalOpen, setSendReminderModalOpen] = useState(false);
  const [reminderPrefillDebtor, setReminderPrefillDebtor] = useState(null);
  const [reminderPrefillAmount, setReminderPrefillAmount] = useState(null);

  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeTargetExpense, setDisputeTargetExpense] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Toast stack
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appState.theme || "dark");
  }, [appState.theme]);

  const handleToggleTheme = () => {
    const next = appState.theme === "dark" ? "light" : "dark";
    setAppState(prev => ({ ...prev, theme: next }));
  };

  const handleSwitchUser = (userId) => {
    const user = appState.users.find(u => u.id === userId);
    setAppState(prev => ({
      ...prev,
      activeUserId: userId,
      activeRole: user?.role === "admin" ? "admin" : prev.activeRole
    }));
    addToast({
      type: "info",
      title: "Profile Switched",
      message: `Viewing application as ${user?.name || "User"}.`
    });
  };

  const handleSwitchRole = (role) => {
    setAppState(prev => ({ ...prev, activeRole: role }));
    addToast({
      type: "info",
      title: role === "admin" ? "Admin Mode Activated" : "User Mode Activated",
      message: role === "admin" ? "Switched to platform operations & audit console." : "Switched to personal shared expense dashboard."
    });
  };

  // Handlers for Add Expense
  const handleOpenAddExpense = (groupId = null) => {
    setPreselectedGroupId(groupId);
    setAddExpenseModalOpen(true);
  };

  const handleSaveExpense = (newExpense) => {
    setAppState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));
    addToast({
      type: "success",
      title: "Expense Logged",
      message: `"${newExpense.description}" split successfully.`
    });
  };

  const handleDeleteExpense = (expenseId) => {
    setAppState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== expenseId)
    }));
    addToast({
      type: "info",
      title: "Expense Removed",
      message: "The bill has been deleted from history."
    });
  };

  // Handlers for Settle Up
  const handleOpenSettleUp = (prefill = null) => {
    setSettlePrefillData(prefill);
    setSettleUpModalOpen(true);
  };

  const handleRecordSettlement = (newSettlement) => {
    setAppState(prev => ({
      ...prev,
      settlements: [newSettlement, ...prev.settlements]
    }));
    addToast({
      type: "success",
      title: "Payment Recorded",
      message: `Settlement of $${newSettlement.amount.toFixed(2)} recorded.`
    });
  };

  // Handlers for Reminders
  const handleOpenSendReminder = (debtor = null, amount = null) => {
    setReminderPrefillDebtor(debtor);
    setReminderPrefillAmount(amount);
    setSendReminderModalOpen(true);
  };

  const handleSendReminder = (reminderRecord) => {
    setAppState(prev => ({
      ...prev,
      reminders: [reminderRecord, ...prev.reminders]
    }));
    addToast({
      type: "success",
      title: "Reminder Dispatched",
      message: `Payment nudge sent via ${reminderRecord.channel}.`
    });
  };

  const handleDismissReminder = (remId) => {
    setAppState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== remId)
    }));
  };

  // Handlers for Groups
  const handleCreateGroup = (newGroup) => {
    setAppState(prev => ({
      ...prev,
      groups: [newGroup, ...prev.groups]
    }));
    setSelectedGroupId(newGroup.id);
    setActiveTab("groups");
    addToast({
      type: "success",
      title: "Group Created",
      message: `"${newGroup.name}" is ready for shared expenses.`
    });
  };

  const handleUpdateGroup = (updatedGroup) => {
    setAppState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === updatedGroup.id ? updatedGroup : g)
    }));
    addToast({
      type: "info",
      title: "Group Updated",
      message: `"${updatedGroup.name}" settings saved.`
    });
  };

  const handleDeleteGroup = (groupId) => {
    setAppState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId)
    }));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
    addToast({
      type: "info",
      title: "Group Deleted",
      message: "The group has been permanently removed."
    });
  };

  // Handlers for Disputes
  const handleOpenDispute = (expense) => {
    setDisputeTargetExpense(expense);
    setDisputeModalOpen(true);
  };

  const handleReportDispute = (disputeRecord) => {
    setAppState(prev => ({
      ...prev,
      disputes: [disputeRecord, ...prev.disputes]
    }));
    addToast({
      type: "info",
      title: "Dispute Lodged",
      message: "Our platform administrator has been notified to review the split."
    });
  };

  const handleResolveDispute = (disputeId, resolutionNotes) => {
    setAppState(prev => ({
      ...prev,
      disputes: prev.disputes.map(d =>
        d.id === disputeId
          ? { ...d, status: "resolved", resolutionNotes, resolvedBy: prev.activeUserId }
          : d
      )
    }));
    addToast({
      type: "success",
      title: "Dispute Resolved",
      message: "Resolution note recorded and participants notified."
    });
  };

  // Handlers for Admin User & Settings Controls
  const handleUpdateUser = (updatedUser) => {
    setAppState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    addToast({
      type: "info",
      title: "User Account Updated",
      message: `${updatedUser.name}'s status and role have been updated.`
    });
  };

  const handleAddUser = (newUser) => {
    setAppState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    addToast({
      type: "success",
      title: "User Added",
      message: `${newUser.name} registered to the platform.`
    });
  };

  const handleAddCategory = (newCat) => {
    setAppState(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    addToast({
      type: "success",
      title: "Category Added",
      message: `"${newCat.name}" is now available for expenses.`
    });
  };

  const handleUpdateSettings = (newSettings) => {
    setAppState(prev => ({
      ...prev,
      settings: newSettings
    }));
    addToast({
      type: "success",
      title: "Settings Saved",
      message: "Platform parameters updated."
    });
  };

  const handleResetToDemo = () => {
    const defaults = resetAppToDefaults();
    setAppState(defaults);
    setSelectedGroupId(null);
    addToast({
      type: "success",
      title: "Reset Complete",
      message: "Factory demo dataset has been re-initialized."
    });
  };

  const handleRestoreState = (restored) => {
    setAppState(restored);
    setSelectedGroupId(null);
    addToast({
      type: "success",
      title: "Backup Restored",
      message: "Application state loaded from backup file."
    });
  };

  const activeUser = appState.users.find(u => u.id === appState.activeUserId) || appState.users[0];
  const unreadRemindersCount = appState.reminders.filter(r => r.toUserId === activeUser?.id).length;
  const currentSelectedGroup = selectedGroupId ? appState.groups.find(g => g.id === selectedGroupId) : null;

  return (
    <div>
      {/* Universal Top Navigation Header */}
      <Navbar
        activeRole={appState.activeRole}
        setActiveRole={handleSwitchRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedGroupId(null);
        }}
        activeUser={activeUser}
        users={appState.users}
        onSwitchUser={handleSwitchUser}
        theme={appState.theme}
        onToggleTheme={handleToggleTheme}
        onOpenAddExpense={() => handleOpenAddExpense(selectedGroupId)}
        onOpenNotifications={() => setNotificationsOpen(!notificationsOpen)}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Main Container */}
      <main className="app-container">
        {/* USER MODULE VIEW */}
        {appState.activeRole === "user" ? (
          <div>
            {activeTab === "dashboard" && (
              <UserDashboard
                activeUser={activeUser}
                users={appState.users}
                groups={appState.groups}
                expenses={appState.expenses}
                settlements={appState.settlements}
                categories={appState.categories}
                onOpenAddExpense={handleOpenAddExpense}
                onOpenSettleUp={handleOpenSettleUp}
                onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
                onOpenSendReminder={handleOpenSendReminder}
                onSelectGroup={(groupId) => {
                  setSelectedGroupId(groupId);
                  setActiveTab("groups");
                }}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedGroupId(null);
                }}
              />
            )}

            {activeTab === "groups" && (
              <div>
                {currentSelectedGroup ? (
                  <GroupDetail
                    group={currentSelectedGroup}
                    users={appState.users}
                    expenses={appState.expenses}
                    settlements={appState.settlements}
                    categories={appState.categories}
                    activeUserId={activeUser.id}
                    onBack={() => setSelectedGroupId(null)}
                    onOpenAddExpense={handleOpenAddExpense}
                    onOpenSettleUp={handleOpenSettleUp}
                    onOpenDispute={handleOpenDispute}
                    onDeleteExpense={handleDeleteExpense}
                  />
                ) : (
                  <GroupsView
                    groups={appState.groups}
                    users={appState.users}
                    expenses={appState.expenses}
                    settlements={appState.settlements}
                    activeUserId={activeUser.id}
                    onSelectGroup={(id) => setSelectedGroupId(id)}
                    onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
                  />
                )}
              </div>
            )}

            {activeTab === "expenses" && (
              <ExpenseHistory
                expenses={appState.expenses}
                users={appState.users}
                groups={appState.groups}
                categories={appState.categories}
                activeUserId={activeUser.id}
                onOpenAddExpense={handleOpenAddExpense}
                onOpenDispute={handleOpenDispute}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === "friends" && (
              <FriendsView
                users={appState.users}
                expenses={appState.expenses}
                settlements={appState.settlements}
                activeUser={activeUser}
                onOpenSettleUp={handleOpenSettleUp}
                onOpenSendReminder={handleOpenSendReminder}
                onOpenAddExpense={handleOpenAddExpense}
                onAddNewFriend={handleAddUser}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsView
                expenses={appState.expenses}
                categories={appState.categories}
                users={appState.users}
                groups={appState.groups}
              />
            )}
          </div>
        ) : (
          /* ADMIN MODULE VIEW */
          <AdminDashboard
            appState={appState}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onResolveDispute={handleResolveDispute}
            onAddCategory={handleAddCategory}
            onUpdateSettings={handleUpdateSettings}
            onResetToDemo={handleResetToDemo}
            onRestoreState={handleRestoreState}
          />
        )}
      </main>

      {/* Floating Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        reminders={appState.reminders}
        activeUserId={activeUser.id}
        users={appState.users}
        onSettleFromReminder={(rem) => {
          handleOpenSettleUp({
            fromUserId: activeUser.id,
            toUserId: rem.fromUserId,
            amount: rem.amount,
            notes: `Settling balance: ${rem.message}`
          });
        }}
        onDismissReminder={handleDismissReminder}
      />

      {/* Interactive Modals */}
      <AddExpenseModal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        onSaveExpense={handleSaveExpense}
        users={appState.users}
        groups={appState.groups}
        categories={appState.categories}
        activeUserId={activeUser.id}
        preselectedGroupId={preselectedGroupId}
      />

      <SettleUpModal
        isOpen={settleUpModalOpen}
        onClose={() => setSettleUpModalOpen(false)}
        onRecordSettlement={handleRecordSettlement}
        users={appState.users}
        groups={appState.groups}
        activeUserId={activeUser.id}
        prefillData={settlePrefillData}
      />

      <SendReminderModal
        isOpen={sendReminderModalOpen}
        onClose={() => setSendReminderModalOpen(false)}
        onSendReminder={handleSendReminder}
        users={appState.users}
        groups={appState.groups}
        activeUser={activeUser}
        prefillDebtor={reminderPrefillDebtor}
        prefillAmount={reminderPrefillAmount}
      />

      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        users={appState.users}
        activeUserId={activeUser.id}
      />

      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        expense={disputeTargetExpense}
        activeUserId={activeUser.id}
        onSubmitDispute={handleReportDispute}
      />

      {/* Toast Stack */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
