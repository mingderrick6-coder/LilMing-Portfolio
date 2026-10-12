import collectionData from "./collections.generated.json";

export type CollectionImage = {
  id: string;
  title: string;
  src: string;
  width: number;
  height: number;
  thumbnail: string;
  previewWidth: number;
  previewHeight: number;
  animated?: boolean;
  phonePreview?: string;
  segments?: { src: string; width: number; height: number }[];
};

export type CollectionSection = {
  id: string;
  title: string;
  images: CollectionImage[];
};

export type Collection = {
  slug: string;
  title: string;
  index: number;
  layout: "grid" | "reading" | "sequence";
  cover: string;
  sections: CollectionSection[];
};

export const collections = collectionData as Collection[];
