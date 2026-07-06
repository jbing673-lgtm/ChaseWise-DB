import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner />
      </div>
    </div>
  );
}
