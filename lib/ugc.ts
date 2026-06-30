import ugcData from "@/data/ugc.json";

export type UGCPhoto = {
  id: string;
  image: string;
  productId: string;
  caption?: string;
};

export const ugcPhotos: UGCPhoto[] = ugcData as UGCPhoto[];
