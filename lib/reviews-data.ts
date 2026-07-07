import { getFile, putFile } from "@/lib/github";
import type { Review } from "@/data/category-reviews";

export type PendingReview = {
  id:          string; // sessionId + submission timestamp, unique per submission
  sessionId:   string;
  category:    string;
  productId?:  string; // undefined for multi-item cart orders we couldn't resolve to one product
  productName: string;
  name:        string;
  location:    string;
  rating:      number;
  headline:    string;
  text:        string;
  image?:      string;
  submittedAt: string; // ISO
};

const PENDING_PATH  = "data/pending-reviews.json";
const CUSTOMER_PATH = "data/customer-reviews.json";

export async function getPendingReviews(): Promise<{ reviews: PendingReview[]; sha: string }> {
  const { content, sha } = await getFile(PENDING_PATH);
  return { reviews: JSON.parse(content) as PendingReview[], sha };
}

export async function savePendingReviews(reviews: PendingReview[], sha: string, message: string): Promise<void> {
  await putFile(PENDING_PATH, JSON.stringify(reviews, null, 2) + "\n", sha, message);
}

export async function getCustomerReviews(): Promise<{ data: Record<string, Review[]>; sha: string }> {
  const { content, sha } = await getFile(CUSTOMER_PATH);
  return { data: JSON.parse(content) as Record<string, Review[]>, sha };
}

export async function saveCustomerReviews(data: Record<string, Review[]>, sha: string, message: string): Promise<void> {
  await putFile(CUSTOMER_PATH, JSON.stringify(data, null, 2) + "\n", sha, message);
}
