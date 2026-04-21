import { getShoppingCartData } from "@/lib/actions/shopping-cart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ShoppingCart } from "@/components/features/shopping/shopping-cart";

export default async function ShoppingPage() {
  const data = await getShoppingCartData();

  // Collect cover thumbnail keys from projects
  const imageKeys = data.projects.map((p) => p.coverThumbnailUrl).filter(Boolean) as string[];
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground text-sm">Select projects to build your shopping list</p>
      </div>

      <ShoppingCart data={data} imageUrls={imageUrls} />
    </div>
  );
}
