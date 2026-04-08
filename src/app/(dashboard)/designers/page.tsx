import { getDesignersWithStats } from "@/lib/actions/designer-actions";
import { DesignerList } from "@/components/features/designers/designer-list";

export default async function DesignersPage() {
  const designers = await getDesignersWithStats();
  return <DesignerList designers={designers} />;
}
