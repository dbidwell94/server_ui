// Reusable theme configuration - using static class name objects to work with Tailwind's purging
// Each variant is explicitly defined with its full class string to ensure Tailwind can see them

export const buttonClasses = {
  primary:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-indigo-600 hover:bg-indigo-700 text-white",
  success:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-emerald-600 hover:bg-emerald-700 text-white",
  secondary:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-slate-600 hover:bg-slate-700 text-white",
} as const;

export const containerClasses = {
  primary:
    "min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex items-center justify-center",
  secondary:
    "min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 flex items-center justify-center",
  tertiary:
    "min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center",
} as const;

export const cardClasses = {
  default:
    "bg-slate-800 rounded-lg shadow-xl p-8 max-w-md border border-slate-700",
} as const;

export const textClasses = {
  heading: "text-4xl font-bold text-white mb-4",
  largeHeading: "text-5xl md:text-6xl font-bold text-white mb-6",
  subtitle: "text-xl md:text-2xl text-gray-200 mb-8",
  description: "text-gray-300 mb-6",
  small: "text-sm text-gray-400",
} as const;

export const statusClasses = {
  healthy:
    "inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold",
  unhealthy:
    "inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold",
  loading:
    "inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold",
} as const;

export const cardClasses2 = {
  elevated: "bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700",
  subtle: "bg-slate-700 rounded-lg p-6 border border-slate-600",
} as const;

export const gradientOverlay =
  "absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40";

// Type-safe variants for components
export type ButtonVariant = keyof typeof buttonClasses;
export type ContainerVariant = keyof typeof containerClasses;
export type StatusVariant = keyof typeof statusClasses;
