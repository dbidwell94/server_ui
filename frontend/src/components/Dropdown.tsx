export interface DropdownItem {
  label: string;
  onClick: () => void;
  className?: string;
  element?: React.ReactNode;
  icon?: React.ReactNode;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
}

import { useRef, useEffect } from "react";

export default function Dropdown({
  trigger,
  items,
  isOpen,
  onToggle,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);
  return (
    <div ref={dropdownRef} className="relative">
      <button onClick={onToggle} className="cursor-pointer">
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {items.map((item, index) => {
            
            return item.element ? (
              <div key={index} onClick={onToggle} className="first:rounded-t-lg last:rounded-b-lg">
                {item.element}
              </div>
            ) : (
              <button
                key={index}
                onClick={item.onClick}
                className={
                  item.className ||
                  `flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 first:rounded-t-lg last:rounded-b-lg transition font-medium cursor-pointer`
                }
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
