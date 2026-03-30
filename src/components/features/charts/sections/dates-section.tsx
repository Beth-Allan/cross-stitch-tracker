import { Input } from "@/components/ui/input";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";

interface DatesSectionProps {
  startDate: string;
  finishDate: string;
  ffoDate: string;
  onStartDateChange: (value: string) => void;
  onFinishDateChange: (value: string) => void;
  onFfoDateChange: (value: string) => void;
  errors?: {
    startDate?: string;
    finishDate?: string;
    ffoDate?: string;
  };
}

export function DatesSection({
  startDate,
  finishDate,
  ffoDate,
  onStartDateChange,
  onFinishDateChange,
  onFfoDateChange,
  errors,
}: DatesSectionProps) {
  return (
    <div>
      <SectionHeading title="Dates" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Start Date" htmlFor="start-date" error={errors?.startDate}>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </FormField>
        <FormField label="Finish Date" htmlFor="finish-date" error={errors?.finishDate}>
          <Input
            id="finish-date"
            type="date"
            value={finishDate}
            onChange={(e) => onFinishDateChange(e.target.value)}
          />
        </FormField>
        <FormField label="FFO Date" htmlFor="ffo-date" error={errors?.ffoDate}>
          <Input
            id="ffo-date"
            type="date"
            value={ffoDate}
            onChange={(e) => onFfoDateChange(e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}
