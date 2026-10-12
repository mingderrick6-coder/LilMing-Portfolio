import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/CollectionPage";
import { collections } from "@/data/collections";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);

  return { title: collection ? `${collection.title} — LilMing` : "Collection not found" };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) notFound();

  return <CollectionPage collection={collection} />;
}
