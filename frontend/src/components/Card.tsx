interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`w-full max-w-md bg-white rounded-lg shadow-lg p-8 ${className}`}>
      {children}
    </div>
  );
}
