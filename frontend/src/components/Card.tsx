interface CardProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function Card({
  children,
  className = "",
  fullWidth = false,
}: CardProps) {
  return (
    <div
      className={`${fullWidth ? "w-full" : "w-full max-w-md"} bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}
