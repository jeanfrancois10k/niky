"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastNotification";
import { Zap } from "lucide-react";

export interface BuyNowProductProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  stock: number;
  slug?: string;
}

interface BuyNowButtonProps {
  product: BuyNowProductProps;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  label?: string;
}

export function BuyNowButton({
  product,
  quantity = 1,
  className,
  size = "default",
  label = "Acheter directement",
}: BuyNowButtonProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const { showSuccess } = useToast();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      category: product.category,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      quantity,
    });

    showSuccess(`Redirection vers le paiement pour ${product.name}...`);
    router.push("/commande");
  };

  return (
    <Button
      size={size}
      className={
        className ||
        "rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
      }
      onClick={handleBuyNow}
      disabled={product.stock === 0}
      title="Payer directement sans passer par le panier"
    >
      <Zap className="h-3.5 w-3.5 fill-current" />
      {label}
    </Button>
  );
}
