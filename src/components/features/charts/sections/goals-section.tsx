import { SectionHeading } from "../form-primitives/section-heading";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { StartPreferenceFields } from "../form-primitives/start-preference-fields";

interface GoalsSectionProps {
  wantToStartNext: boolean;
  preferredStartSeason: string | null;
  onWantToStartChange: (checked: boolean) => void;
  onPreferenceChange: (value: string | null) => void;
}

export function GoalsSection({
  wantToStartNext,
  preferredStartSeason,
  onWantToStartChange,
  onPreferenceChange,
}: GoalsSectionProps) {
  return (
    <div>
      <SectionHeading title="Goals & Planning" />
      <div className="space-y-4">
        <StyledCheckbox
          checked={wantToStartNext}
          onChange={onWantToStartChange}
          label="Want to start next"
        />
        <StartPreferenceFields value={preferredStartSeason} onChange={onPreferenceChange} />
      </div>
    </div>
  );
}
