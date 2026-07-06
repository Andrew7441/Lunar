import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const productDir = join(root, "public", "products");

const failures = [];

if (!existsSync(join(dist, "index.html"))) {
  failures.push("dist/index.html is missing");
}

const productImages = existsSync(productDir)
  ? readdirSync(productDir).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
  : [];

if (productImages.length !== 23) {
  failures.push(`expected 23 local product images, found ${productImages.length}`);
}

const emptyImages = productImages.filter((file) => statSync(join(productDir, file)).size < 1000);
if (emptyImages.length > 0) {
  failures.push(`these product images look empty: ${emptyImages.join(", ")}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Build verified: ${productImages.length} product images and dist/index.html are present.`);
