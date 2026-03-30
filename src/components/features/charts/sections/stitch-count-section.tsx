import { SectionHeading } from "../form-primitives/section-heading";
import { StitchCountFields } from "../form-primitives/stitch-count-fields";

interface StitchCountSectionProps {
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCountChange: (value: string) => void;
  errors?: {
    stitchesWide?: string;
    stitchesHigh?: string;
    stitchCount?: string;
  };
}

export function StitchCountSection(props: StitchCountSectionProps) {
  return (
    <div>
      <SectionHeading title="Stitch Count & Dimensions" />
      <StitchCountFields {...props} />
    </div>
  );
}
