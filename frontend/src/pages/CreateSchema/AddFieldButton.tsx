import { PlusIcon } from "@heroicons/react/24/outline";

interface AddFieldButtonProps {
  onClick: () => void;
}

export default function AddFieldButton({ onClick }: AddFieldButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-slate-800/50 transition cursor-pointer"
    >
      <PlusIcon className="h-6 w-6 text-slate-400 hover:text-blue-500" />
      <span className="text-slate-400 hover:text-blue-500 font-medium">Add Field</span>
    </button>
  );
}
