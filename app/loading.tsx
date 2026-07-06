import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );
}