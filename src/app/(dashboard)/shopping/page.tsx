import { ShoppingCart } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function ShoppingPage() {
  return (
    <PlaceholderPage
      title="Shopping"
      description="Smart shopping lists, built from your projects. Never buy duplicate thread again."
      icon={ShoppingCart}
    />
  );
}
