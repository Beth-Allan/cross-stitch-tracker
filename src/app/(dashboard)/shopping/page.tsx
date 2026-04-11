import { getShoppingList } from "@/lib/actions/shopping-actions";
import { ShoppingList } from "@/components/features/shopping/shopping-list";

export default async function ShoppingPage() {
  const projects = await getShoppingList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Shopping List</h1>
        <p className="text-muted-foreground text-sm">
          Supplies you still need, grouped by project.
        </p>
      </div>

      <ShoppingList projects={projects} />
    </div>
  );
}
