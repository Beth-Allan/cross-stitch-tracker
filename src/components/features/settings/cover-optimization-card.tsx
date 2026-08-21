"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizeExistingCover } from "@/lib/actions/cover-backfill-actions";

interface CoverOptimizationCardProps {
  charts: { id: string; name: string }[];
}

type LeftAlone = { id: string; name: string; reason: string };

const GENERIC_FAILURE = "Something went wrong, so this one was left as it was";

/**
 * Starts and follows the one-off shrinking of the covers already in the library.
 *
 * The run is a loop of one-chart calls rather than a single request: hundreds of
 * photos cannot be re-encoded inside one, and doing them one at a time is what
 * makes closing the page harmless — the next run asks the database what is left
 * rather than resuming remembered progress.
 */
export function CoverOptimizationCard({ charts }: CoverOptimizationCardProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [shrunk, setShrunk] = useState(0);
  const [leftAlone, setLeftAlone] = useState<LeftAlone[] | null>(null);

  // A run is a loop of awaited calls, not one request, so leaving the page has to
  // stop it — otherwise it would carry on converting covers with nothing on screen
  // to show for it. Stopping loses nothing: the next run asks the database what is
  // left, so it picks up exactly where this one stood.
  const abandoned = useRef(false);
  useEffect(() => {
    abandoned.current = false;
    return () => {
      abandoned.current = true;
    };
  }, []);

  async function handleStart() {
    const work = charts;
    setRunning(true);
    setTotal(work.length);
    setProcessed(0);
    setShrunk(0);
    setLeftAlone(null);

    const failures: LeftAlone[] = [];
    let succeeded = 0;

    for (const [index, chart] of work.entries()) {
      if (abandoned.current) return;
      try {
        const result = await optimizeExistingCover(chart.id);
        if (result.success) {
          succeeded += 1;
          setShrunk(succeeded);
        } else {
          failures.push({ id: chart.id, name: chart.name, reason: result.error });
        }
      } catch {
        // One chart failing is not the run failing: the rest of the library still
        // has covers worth shrinking.
        failures.push({ id: chart.id, name: chart.name, reason: GENERIC_FAILURE });
      }
      setProcessed(index + 1);
    }

    setLeftAlone(failures);
    setRunning(false);
    router.refresh();
  }

  const waiting = charts.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageDown className="text-primary h-4 w-4" strokeWidth={1.5} />
          Cover photo sizes
        </CardTitle>
        <CardDescription>
          Covers added from now on are shrunk as you save them. Older ones are still stored at the
          full size the camera made, which is why an older chart can be slow to open.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {waiting === 0 ? (
          <p className="text-muted-foreground">
            Every cover photo in your library has already been shrunk. There is nothing to do here.
          </p>
        ) : (
          <p>
            <span className="font-medium">
              {waiting} cover {waiting === 1 ? "photo is" : "photos are"}
            </span>{" "}
            still stored at full size. Shrinking them changes nothing about your charts — only how
            much has to be downloaded to show a picture.
          </p>
        )}

        {waiting > 0 && (
          <Button onClick={handleStart} disabled={running}>
            {running ? "Shrinking…" : `Shrink ${waiting === 1 ? "it" : "them"}`}
          </Button>
        )}

        <p aria-live="polite" className="text-muted-foreground">
          {running && `Shrinking… ${processed} of ${total} done.`}
          {!running &&
            leftAlone !== null &&
            `Finished — ${shrunk} shrunk${leftAlone.length > 0 ? `, ${leftAlone.length} left alone.` : "."}`}
        </p>

        {leftAlone !== null && leftAlone.length > 0 && (
          <div className="space-y-1">
            <p>These charts were left exactly as they were:</p>
            <ul className="text-muted-foreground space-y-1">
              {leftAlone.map((failure) => (
                <li key={failure.id}>
                  <span className="text-foreground font-medium">{failure.name}</span> —{" "}
                  {failure.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
