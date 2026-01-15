import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Dropdown from "./Dropdown";
import type { User } from "../contexts/AuthContext";

interface UserDropdownProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function UserDropdown({
  user,
  isOpen,
  onToggle,
  onLogout,
}: UserDropdownProps) {
  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
          {user.username}
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      }
      items={[
        {
          label: "Logout",
          onClick: onLogout,
          className:
            "w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition font-medium cursor-pointer",
        },
      ]}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}
