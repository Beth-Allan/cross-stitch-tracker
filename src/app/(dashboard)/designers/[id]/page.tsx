import { notFound } from "next/navigation";
import { getDesigner } from "@/lib/actions/designer-actions";
import { DesignerDetail } from "@/components/features/designers/designer-detail";

export default async function DesignerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const designer = await getDesigner(id);
  if (!designer) notFound();
  return <DesignerDetail designer={designer} />;
}
