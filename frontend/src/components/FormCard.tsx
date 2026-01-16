import React from "react";

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function FormCard({ title, subtitle, children }: FormCardProps) {
  return (
    <div className="flex items-center justify-center px-4 w-full">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-gray-300">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
