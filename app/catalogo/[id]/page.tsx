import type { Metadata } from "next";
import { getProduct } from "@/lib/firebase/products-service";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Producto no encontrado | Studio 3D",
      description: "El producto solicitado no existe o no está disponible.",
    };
  }

  const firstImageUrl = product.images?.[0]?.url || "";

  return {
    title: `${product.name} | Studio 3D`,
    description: product.description || "",
    openGraph: {
      title: `${product.name} | Studio 3D`,
      description: product.description || "",
      images: firstImageUrl ? [firstImageUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Studio 3D`,
      description: product.description || "",
      images: firstImageUrl ? [firstImageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
