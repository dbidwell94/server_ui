interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`w-full max-w-md bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700 ${className}`}>
      {children}
    </div>
  );
}
