export interface TabConfig {
  label: string;
  value: string;
  badge?: string | number;
}

interface TabSelectorProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabSelector({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  return (
    <div className="flex gap-2 border-b border-slate-700 justify-around">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2 font-medium transition ${
            activeTab === tab.value
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && ` (${tab.badge})`}
        </button>
      ))}
    </div>
  );
}
