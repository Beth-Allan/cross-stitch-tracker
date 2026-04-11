import { getShoppingList } from "@/lib/actions/shopping-actions";
import { ShoppingList } from "@/components/features/shopping/shopping-list";

export default async function ShoppingPage() {
  const projects = await getShoppingList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold font-heading text-foreground">
          Shopping List
        </h1>
        <p className="text-sm text-muted-foreground">
          Supplies you still need, grouped by project.
        </p>
      </div>

      <ShoppingList projects={projects} />
    </div>
  );
}
