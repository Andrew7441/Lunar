export type ProductCategory =
  | "Cleanse"
  | "Moisturize"
  | "Masks"
  | "Serums"
  | "Sun care"
  | "Acne care"
  | "Anti-aging"
  | "Brightening"
  | "Professional";

export type ProductSourceCategory =
  | "Acne Treatment"
  | "Anti-Aging"
  | "Dry Skin"
  | "Masks"
  | "Mesotherapy"
  | "Other Cosmetics"
  | "Peelings"
  | "Skin Whitening"
  | "Soft Skin";

export type Product = {
  id: string;
  name: string;
  sku: string;
  size: string;
  priceLabel: string;
  priceNis: number | null;
  image: string;
  sourceImage: string;
  detailUrl: string;
  sourceCategory: ProductSourceCategory;
  categories: ProductCategory[];
  concerns: string[];
  format: "cream" | "cleanser" | "mask" | "serum" | "spf" | "professional";
  description: string;
  verifiedFrom: "LUNAR product listing";
};

export type SortMode = "featured" | "name" | "price-low" | "price-high";

export type InquiryProduct = Pick<Product, "id" | "name" | "sku" | "size" | "priceLabel">;
