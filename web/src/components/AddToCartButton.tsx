"use client";

import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastNotification";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
    category: string;
    stock: number;
    slug?: string;
  };
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
}

export function AddToCartButton({ product, quantity = 1, className, size = "default" }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);
  const { showSuccess } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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

    showSuccess(`${product.name} (${quantity} ${product.unit}) ajouté au panier !`);
  };

  return (
    <Button 
      size={size} 
      className={className || "rounded-full bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 cursor-pointer"}
      onClick={handleAdd}
      disabled={product.stock === 0}
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      Ajouter
    </Button>
  );
}
