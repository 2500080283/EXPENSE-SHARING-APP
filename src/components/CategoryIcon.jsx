import React from "react";
import {
  ShoppingCart,
  Home,
  Utensils,
  Zap,
  Plane,
  Film,
  ShoppingBag,
  HeartPulse,
  Tag,
  Palmtree,
  Coffee
} from "lucide-react";

const ICON_MAP = {
  ShoppingCart,
  Home,
  Utensils,
  Zap,
  Plane,
  Film,
  ShoppingBag,
  HeartPulse,
  Tag,
  Palmtree,
  Coffee
};

export default function CategoryIcon({ iconName, color = "#10b981", bg = "rgba(16, 185, 129, 0.15)", size = 18 }) {
  const IconComponent = ICON_MAP[iconName] || Tag;

  return (
    <div
      className="category-icon-circle"
      style={{
        backgroundColor: bg,
        color: color
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
}
