import React from "react";

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function FormCard({ title, subtitle, children }: FormCardProps) {
  return (
    <div className="flex items-center justify-center px-4 w-full">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
