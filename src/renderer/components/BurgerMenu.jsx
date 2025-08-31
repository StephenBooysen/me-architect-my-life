import React from "react";
import { Menu, X } from "lucide-react";

function BurgerMenu({ isOpen, onToggle, className = "" }) {
  return (
    <button
      onClick={onToggle}
      className={className}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <Menu size={24} />
      )}
    </button>
  );
}

export default BurgerMenu;