import { Card, CardContent } from "@/components/ui/card";

export function DataUnavailable({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-[120px] items-center justify-center">
        <p className="text-muted-foreground text-sm" role="status">
          {label} temporarily unavailable. Try refreshing the page.
        </p>
      </CardContent>
    </Card>
  );
}
