// app/terminal/loading.tsx — streamed during data fetch on /terminal.
import { DeskShell } from "@/components/desk/DeskShell";
import {
  MetricStripSkeleton,
  FirehoseSkeleton,
  ChartSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import { LINE_2 } from "@/lib/theme";

const cardShell = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
  border: `1px solid ${LINE_2}`,
  borderRadius: 16,
};

export default function Loading() {
  return (
    <DeskShell breadcrumb="Desk">
      <MetricStripSkeleton />
      <FirehoseSkeleton />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 p-6 space-y-3" style={cardShell}>
          <Skeleton className="h-[10px] w-32" />
          <Skeleton className="h-6 w-48" strong />
          <div className="space-y-2 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 p-6 space-y-3" style={cardShell}>
          <Skeleton className="h-[10px] w-28" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-md" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-4 p-6 space-y-3" style={cardShell}>
          <Skeleton className="h-[10px] w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
      <ChartSkeleton height={260} />
    </DeskShell>
  );
}
