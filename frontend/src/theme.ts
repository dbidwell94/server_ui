// Reusable theme configuration - using static class name objects to work with Tailwind's purging
// Each variant is explicitly defined with its full class string to ensure Tailwind can see them

export const buttonClasses = {
  primary:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-blue-600 hover:bg-blue-700 text-white",
  success:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-green-600 hover:bg-green-700 text-white",
  secondary:
    "block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-purple-600 hover:bg-purple-700 text-white",
} as const;

export const containerClasses = {
  primary:
    "min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center",
  secondary:
    "min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center",
  tertiary:
    "min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center",
} as const;

export const cardClasses = {
  default: "bg-white rounded-lg shadow-xl p-8 max-w-md",
} as const;

export const textClasses = {
  heading: "text-4xl font-bold text-gray-800 mb-4",
  largeHeading: "text-5xl md:text-6xl font-bold text-white mb-6",
  subtitle: "text-xl md:text-2xl text-white/90 mb-8",
  description: "text-gray-600 mb-6",
  small: "text-sm text-gray-500",
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
  elevated: "bg-white rounded-lg shadow-lg p-6 border border-gray-200",
  subtle: "bg-gray-50 rounded-lg p-6 border border-gray-100",
} as const;

export const gradientOverlay =
  "absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40";

// Type-safe variants for components
export type ButtonVariant = keyof typeof buttonClasses;
export type ContainerVariant = keyof typeof containerClasses;
export type StatusVariant = keyof typeof statusClasses;
