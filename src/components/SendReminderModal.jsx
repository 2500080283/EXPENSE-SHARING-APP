import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { formatCurrency } from "../utils/formatters";
import { Bell, Copy, Check, Share2 } from "lucide-react";

export default function SendReminderModal({
  isOpen,
  onClose,
  onSendReminder,
  users,
  activeUser,
  prefillDebtor = null,
  prefillAmount = null
}) {
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [template, setTemplate] = useState("friendly");
  const [customMessage, setCustomMessage] = useState("");
  const [channel, setChannel] = useState("in-app");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefillDebtor) {
      setRecipientId(prefillDebtor.id || prefillDebtor);
    } else {
      const firstOther = users.find(u => u.id !== activeUser?.id);
      if (firstOther && !recipientId) {
        setRecipientId(firstOther.id);
      }
    }
    if (prefillAmount) {
      setAmount(prefillAmount.toString());
    }
  }, [prefillDebtor, prefillAmount, activeUser, users]);

  const recipient = users.find(u => u.id === recipientId);
  const formattedAmt = amount ? formatCurrency(parseFloat(amount) || 0) : "$0.00";

  // Pre-generate template texts
  const getTemplateText = (tplKey) => {
    const recName = recipient?.name || "Friend";
    const myHandle = activeUser?.paymentHandle ? `(${activeUser.paymentHandle})` : "";

    switch (tplKey) {
      case "friendly":
        return `Hey ${recName}! Just a friendly nudge regarding the pending balance of ${formattedAmt}. Whenever you have a chance, feel free to settle up. Thanks! 😊`;
      case "casual":
        return `Hi ${recName}! Hope you're having a wonderful week. Could you please send over ${formattedAmt} when you get a moment? Settle via ${myHandle || "your preferred app"}. Appreciate it!`;
      case "urgent":
        return `Notice: Hi ${recName}, please clear your outstanding balance of ${formattedAmt} at your earliest convenience to keep our shared ledger squared away. Payment info: ${myHandle}. Thank you.`;
      default:
        return "";
    }
  };

  useEffect(() => {
    setCustomMessage(getTemplateText(template));
  }, [template, recipientId, amount]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(customMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientId) return;

    const reminderRecord = {
      id: "rem_" + Date.now(),
      fromUserId: activeUser.id,
      toUserId: recipientId,
      groupId: null,
      amount: parseFloat(amount) || 0,
      message: customMessage,
      channel,
      status: "sent",
      sentAt: new Date().toISOString()
    };

    onSendReminder(reminderRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Payment Reminder"
      subtitle="Politely remind group members or friends about their pending share."
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        {/* Recipient and Amount */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Send Reminder To</label>
            <select
              className="form-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            >
              {users.filter(u => u.id !== activeUser?.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Pending Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input mono"
              value={amount}
              placeholder="0.00"
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ fontWeight: 700 }}
            />
          </div>
        </div>

        {/* Template Tone Selector */}
        <div className="form-group">
          <label className="form-label">Reminder Tone Preset</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            <button
              type="button"
              className={`split-mode-pill ${template === "friendly" ? "active" : ""}`}
              onClick={() => setTemplate("friendly")}
            >
              😊 Friendly Nudge
            </button>
            <button
              type="button"
              className={`split-mode-pill ${template === "casual" ? "active" : ""}`}
              onClick={() => setTemplate("casual")}
            >
              ☕ Casual Chat
            </button>
            <button
              type="button"
              className={`split-mode-pill ${template === "urgent" ? "active" : ""}`}
              onClick={() => setTemplate("urgent")}
            >
              ⚡ Formal / Clear
            </button>
          </div>
        </div>

        {/* Message Preview and Edit */}
        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label className="form-label" style={{ margin: 0 }}>Message Preview</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCopyMessage}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleWhatsAppShare}
                title="Share via WhatsApp"
              >
                <Share2 size={14} /> WhatsApp
              </button>
            </div>
          </div>
          <textarea
            className="form-textarea"
            rows="4"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            style={{ fontSize: "0.875rem", lineHeight: 1.5 }}
          />
        </div>

        {/* Channel Selection */}
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Delivery Channel</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="channel"
                value="in-app"
                checked={channel === "in-app"}
                onChange={() => setChannel("in-app")}
                style={{ accentColor: "var(--primary)" }}
              />
              In-App Notification
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="channel"
                value="whatsapp"
                checked={channel === "whatsapp"}
                onChange={() => setChannel("whatsapp")}
                style={{ accentColor: "var(--primary)" }}
              />
              Simulated WhatsApp / SMS
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Bell size={18} /> Send Reminder
          </button>
        </div>
      </form>
    </Modal>
  );
}
