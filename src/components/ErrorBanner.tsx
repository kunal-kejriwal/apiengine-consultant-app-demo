import { ApiError } from '../api/client';

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

export default function ErrorBanner({ error, className = '' }: ErrorBannerProps) {
  const message =
    error instanceof ApiError
      ? `${error.detail} (HTTP ${error.status})`
      : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className={`flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 ${className}`}>
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
