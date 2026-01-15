export interface DropdownItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function Dropdown({
  trigger,
  items,
  isOpen,
  onToggle,
}: DropdownProps) {
  return (
    <div className="relative">
      <button onClick={onToggle} className="cursor-pointer">
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={
                item.className ||
                "w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition font-medium cursor-pointer"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
