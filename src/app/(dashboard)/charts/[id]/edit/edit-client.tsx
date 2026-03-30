"use client";

import { useRouter } from "next/navigation";
import type { Designer, Genre } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import { ChartEditModal } from "@/components/features/charts/chart-edit-modal";

interface EditChartPageClientProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
}

export function EditChartPageClient({ chart, designers, genres }: EditChartPageClientProps) {
  const router = useRouter();

  return (
    <ChartEditModal
      chart={chart}
      designers={designers}
      genres={genres}
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push(`/charts/${chart.id}`);
        }
      }}
      onSuccess={() => {
        router.push(`/charts/${chart.id}`);
      }}
    />
  );
}
