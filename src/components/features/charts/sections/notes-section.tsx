import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <div>
      <SectionHeading title="Notes" />
      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Any additional notes about this chart..."
        />
      </FormField>
    </div>
  );
}
