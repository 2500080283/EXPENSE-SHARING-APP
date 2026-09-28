import React, { useState } from "react";

export default function UserAvatar({ user, size = "md", showRole = false }) {
  const [imageError, setImageError] = useState(false);

  if (!user) {
    return (
      <div className={`avatar avatar-${size} avatar-fallback`}>
        ?
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Generate deterministic gradient based on user name
  const getGradient = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
    const c2 = `hsl(${(Math.abs(hash) + 40) % 360}, 70%, 35%)`;
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {user.avatar && !imageError ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`avatar avatar-${size}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`avatar avatar-${size} avatar-fallback`}
          style={{ background: getGradient(user.name) }}
        >
          {initials}
        </div>
      )}
      {showRole && user.role === "admin" && (
        <span
          title="System Admin"
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#6366f1",
            border: "2px solid #111827"
          }}
        />
      )}
    </div>
  );
}
