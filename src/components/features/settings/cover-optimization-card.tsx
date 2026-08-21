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

const GENERIC_FAILURE = "the app could not be reached, so it was left as it was";

/**
 * How many *unexplained* failures in a row mean the problem is not the photos.
 * A failure the server pins on the chart itself — its picture is gone, too big,
 * unreadable — is a chart to report and move past, and never counts here: the
 * work list is in a fixed order and such a chart stays on it, so counting those
 * would stop every run at the same five. Five in a row that nothing about the
 * chart explains is storage being unreachable, and carrying on would issue
 * hundreds of doomed requests and hand Beth a list of every chart she owns.
 * Stopping costs nothing — the next run picks up what is left.
 */
const CONSECUTIVE_FAILURE_LIMIT = 5;

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
  const [alreadyDone, setAlreadyDone] = useState(0);
  const [leftAlone, setLeftAlone] = useState<LeftAlone[] | null>(null);
  const [stoppedEarly, setStoppedEarly] = useState(false);

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
    setAlreadyDone(0);
    setLeftAlone(null);
    setStoppedEarly(false);

    const failures: LeftAlone[] = [];
    let converted = 0;
    let skipped = 0;
    let inARow = 0;

    for (const [index, chart] of work.entries()) {
      if (abandoned.current) return;
      try {
        const result = await optimizeExistingCover(chart.id);
        if (result.success && result.status === "converted") {
          converted += 1;
          inARow = 0;
          setShrunk(converted);
        } else if (result.success) {
          // The list was drawn before the run; another tab, or an earlier run,
          // may have finished one in between. Counting it as shrunk here would
          // report work this run did not do.
          skipped += 1;
          inARow = 0;
          setAlreadyDone(skipped);
        } else {
          // A failure the server lays at this chart's door is a chart to report
          // and move past, not a sign storage is down — it does not count towards
          // giving up, and it ends any run of failures that would.
          inARow = result.cause === "unknown" ? inARow + 1 : 0;
          failures.push({ id: chart.id, name: chart.name, reason: result.error });
        }
      } catch (error) {
        // One chart failing is not the run failing: the rest of the library still
        // has covers worth shrinking.
        console.error("optimizeExistingCover request failed:", error);
        inARow += 1;
        failures.push({ id: chart.id, name: chart.name, reason: GENERIC_FAILURE });
      }
      setProcessed(index + 1);

      if (inARow >= CONSECUTIVE_FAILURE_LIMIT) {
        setStoppedEarly(true);
        break;
      }
    }

    setLeftAlone(failures);
    setRunning(false);
    router.refresh();
  }

  const waiting = charts.length;
  const summary =
    running || leftAlone === null
      ? null
      : [
          `${stoppedEarly ? "Stopped early" : "Finished"} — ${shrunk} shrunk`,
          alreadyDone > 0 && `${alreadyDone} ${alreadyDone === 1 ? "was" : "were"} already done`,
          leftAlone.length > 0 && `${leftAlone.length} left alone`,
        ]
          .filter(Boolean)
          .join(", ") + ".";

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
          {running ? `Shrinking… ${processed} of ${total} done.` : summary}
        </p>

        {stoppedEarly && (
          <p>
            Several in a row could not be done, which usually means the photo storage itself is
            having a problem rather than these particular pictures. Nothing was lost. Try again in a
            while — it will carry on from where it stopped.
          </p>
        )}

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
