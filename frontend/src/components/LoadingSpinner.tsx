interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  fullScreen = true,
}: LoadingSpinnerProps) {
  const content = (
    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-slate-800 to-gray-900">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
}
