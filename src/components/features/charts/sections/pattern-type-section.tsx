import { SectionHeading } from "../form-primitives/section-heading";
import { PatternTypeFields } from "../form-primitives/pattern-type-fields";

interface PatternTypeSectionProps {
  isPaperChart: boolean;
  isFormalKit: boolean;
  isSAL: boolean;
  kitColorCount: number | null;
  onFormatChange: (isPaper: boolean) => void;
  onFormalKitChange: (checked: boolean) => void;
  onSALChange: (checked: boolean) => void;
  onKitColorCountChange: (value: string) => void;
  errors?: { kitColorCount?: string };
}

export function PatternTypeSection(props: PatternTypeSectionProps) {
  return (
    <div>
      <SectionHeading title="Pattern Type" />
      <PatternTypeFields {...props} />
    </div>
  );
}
