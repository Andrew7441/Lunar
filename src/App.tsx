import {
  ArrowUpRight,
  Check,
  ExternalLink,
  FlaskConical,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { catalogStats, categoryLabels, products } from "./data/products";
import type { Product, ProductCategory, SortMode } from "./types";

type FilterOption = ProductCategory | "All";

const CONTACT = {
  phone: "+970 2 275 2670",
  mobile: "+970 569 830 808",
  whatsapp: "972534489590",
  address: "Al-Karkafeh Str., Bethlehem, Palestine",
  facebook: "https://www.facebook.com/lunarcosmetics1/",
  instagram: "https://www.instagram.com/Lunar_Cosmetics_ps/",
};

const filterOptions: FilterOption[] = ["All", ...categoryLabels];

const sourceCategories = Array.from(new Set(products.map((product) => product.sourceCategory)));

const heroProductIds = [
  "fresh-cleanser-150ml",
  "hydro-protector-spf-30-125ml",
  "whitening-peptide-serum-30ml",
  "active-day-cream-spf-15-50ml",
];

const routines = [
  {
    id: "daily",
    label: "Daily care",
    title: "Cleanse, moisturize, protect",
    productIds: ["fresh-cleanser-150ml", "delicate-moisturizer-50ml", "hydro-protector-spf-30-125ml"],
  },
  {
    id: "bright",
    label: "Brightening",
    title: "Tone support with SPF",
    productIds: ["fresh-cleanser-150ml", "whitening-peptide-serum-30ml", "whitening-cream-mask-200ml", "hydro-protector-spf-30-125ml"],
  },
  {
    id: "calm",
    label: "Sensitive skin",
    title: "Calm, soften, rebuild comfort",
    productIds: ["fresh-cleanser-150ml", "relax-mask-200ml", "soothing-moisturizer-50ml"],
  },
  {
    id: "professional",
    label: "Professional",
    title: "Peels and mesotherapy",
    productIds: ["multipeel-pre-fluid-50-ml", "multipeel-gel-serum-50-ml", "meso-liquid-lighten-30-ml", "meso-liquid-repair-30-ml"],
  },
];

function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

function readInquiryIds() {
  try {
    const raw = JSON.parse(localStorage.getItem("lunar-inquiry") ?? "[]") as unknown;
    if (!Array.isArray(raw)) return new Set<string>();
    const validIds = new Set(products.map((product) => product.id));
    return new Set(raw.filter((id): id is string => typeof id === "string" && validIds.has(id)));
  } catch {
    return new Set<string>();
  }
}

function cleanSearch(text: string) {
  return text.trim().toLowerCase();
}

function priceValue(product: Product, fallback: number) {
  return product.priceNis ?? fallback;
}

function makeInquiryMessage(selectedProducts: Product[]) {
  const lines = selectedProducts.map(
    (product) => `- ${product.name} / SKU ${product.sku} / ${product.size} / ${product.priceLabel}`,
  );
  return `Hello LUNAR Cosmetics,\n\nI would like to ask about these products:\n${lines.join("\n")}`;
}

function productById(id: string) {
  return products.find((product) => product.id === id);
}

function App() {
  const [category, setCategory] = useState<FilterOption>("All");
  const [sourceCategory, setSourceCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inquiryIds, setInquiryIds] = useState<Set<string>>(readInquiryIds);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState(routines[0].id);
  const [copied, setCopied] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const heroProducts = heroProductIds.map(productById).filter((product): product is Product => Boolean(product));

  const selectedProducts = useMemo(
    () => products.filter((product) => inquiryIds.has(product.id)),
    [inquiryIds],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = cleanSearch(query);
    const visible = products.filter((product) => {
      const categoryMatch = category === "All" || product.categories.includes(category);
      const sourceMatch = sourceCategory === "All" || product.sourceCategory === sourceCategory;
      const searchText = [
        product.name,
        product.sku,
        product.size,
        product.priceLabel,
        product.sourceCategory,
        product.description,
        ...product.categories,
        ...product.concerns,
      ]
        .join(" ")
        .toLowerCase();
      return categoryMatch && sourceMatch && searchText.includes(normalizedQuery);
    });

    return [...visible].sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "price-low") return priceValue(a, Number.POSITIVE_INFINITY) - priceValue(b, Number.POSITIVE_INFINITY);
      if (sortMode === "price-high") return priceValue(b, Number.NEGATIVE_INFINITY) - priceValue(a, Number.NEGATIVE_INFINITY);
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [category, query, sortMode, sourceCategory]);

  const routine = routines.find((item) => item.id === activeRoutine) ?? routines[0];
  const routineProducts = routine.productIds.map(productById).filter((product): product is Product => Boolean(product));

  const fixedPriceSubtotal = selectedProducts.reduce((total, product) => total + (product.priceNis ?? 0), 0);
  const inquiryMessage = makeInquiryMessage(selectedProducts);
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(inquiryMessage)}`;

  useEffect(() => {
    localStorage.setItem("lunar-inquiry", JSON.stringify([...inquiryIds]));
  }, [inquiryIds]);

  useEffect(() => {
    document.body.classList.toggle("drawer-lock", drawerOpen || Boolean(selectedProduct));
  }, [drawerOpen, selectedProduct]);

  function toggleInquiry(productId: string) {
    setInquiryIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  async function copyInquiry() {
    await navigator.clipboard.writeText(inquiryMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LUNAR Cosmetics home">
          <img src={asset("lunar-logo.png")} alt="LUNAR Cosmetics" />
        </a>

        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <nav className={mobileNavOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          <a href="#catalog" onClick={() => setMobileNavOpen(false)}>
            Products
          </a>
          <a href="#routines" onClick={() => setMobileNavOpen(false)}>
            Routines
          </a>
          <a href="#professional" onClick={() => setMobileNavOpen(false)}>
            Professional
          </a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)}>
            Contact
          </a>
        </nav>

        <button className="inquiry-button" type="button" onClick={() => setDrawerOpen(true)}>
          <ShoppingBag size={18} />
          <span>{selectedProducts.length}</span>
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-background" aria-hidden="true">
            {heroProducts.map((product, index) => (
              <img
                key={product.id}
                className={`hero-product hero-product-${index + 1}`}
                src={asset(product.image)}
                alt=""
              />
            ))}
          </div>
          <div className="hero-content">
            <p className="eyebrow">Bethlehem skincare catalog</p>
            <h1>LUNAR Cosmetics</h1>
            <p>
              A warmer, sharper digital shelf for the full LUNAR line: creams, masks,
              serums, sunscreen, mesotherapy liquids, and professional peel products.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#catalog">
                <Sparkles size={18} />
                Explore catalog
              </a>
              <a className="secondary-action" href="#contact">
                <Phone size={18} />
                Contact LUNAR
              </a>
            </div>
          </div>
        </section>

        <section className="metrics" aria-label="Catalog summary">
          <div>
            <strong>{catalogStats.productCount}</strong>
            <span>verified products</span>
          </div>
          <div>
            <strong>{catalogStats.imageCount}</strong>
            <span>local product photos</span>
          </div>
          <div>
            <strong>{catalogStats.pricedCount}</strong>
            <span>listed prices</span>
          </div>
          <div>
            <strong>{catalogStats.professionalCount}</strong>
            <span>pro products</span>
          </div>
        </section>

        <section className="catalog-shell" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <p className="eyebrow">Product catalog</p>
            <h2 id="catalog-title">Every product, searchable and grouped by care need.</h2>
          </div>

          <div className="catalog-layout">
            <aside className="catalog-panel" aria-label="Catalog controls">
              <label className="field">
                <span>
                  <Search size={17} />
                  Search
                </span>
                <input
                  type="search"
                  value={query}
                  placeholder="cream, SPF, serum..."
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <label className="field">
                <span>
                  <SlidersHorizontal size={17} />
                  Sort
                </span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                  <option value="featured">Featured</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                </select>
              </label>

              <div className="filter-group" aria-label="Care area filters">
                <span className="filter-title">Care area</span>
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className={category === option ? "chip is-active" : "chip"}
                    type="button"
                    onClick={() => setCategory(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="filter-group" aria-label="Current site category filters">
                <span className="filter-title">Catalog section</span>
                {["All", ...sourceCategories].map((option) => (
                  <button
                    key={option}
                    className={sourceCategory === option ? "chip is-active" : "chip"}
                    type="button"
                    onClick={() => setSourceCategory(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </aside>

            <div className="catalog-results">
              <div className="result-bar" aria-live="polite">
                <strong>{filteredProducts.length}</strong>
                <span>products shown</span>
              </div>
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const isSelected = inquiryIds.has(product.id);
                  return (
                    <article className="product-card" key={product.id}>
                      <button
                        className="product-image-button"
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <img src={asset(product.image)} alt={product.name} loading="lazy" />
                      </button>
                      <div className="product-copy">
                        <div className="product-meta">
                          <span>SKU {product.sku}</span>
                          <span>{product.size}</span>
                        </div>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="tag-row">
                          {product.categories.slice(0, 3).map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="product-actions">
                        <strong>{product.priceLabel}</strong>
                        <div>
                          <button className="ghost-action" type="button" onClick={() => setSelectedProduct(product)}>
                            <ArrowUpRight size={17} />
                            Details
                          </button>
                          <button
                            className={isSelected ? "add-action is-added" : "add-action"}
                            type="button"
                            onClick={() => toggleInquiry(product.id)}
                          >
                            {isSelected ? <Check size={17} /> : <ShoppingBag size={17} />}
                            {isSelected ? "Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="routine-section" id="routines" aria-labelledby="routine-title">
          <div className="section-heading">
            <p className="eyebrow">Routine paths</p>
            <h2 id="routine-title">Turn the catalog into ready product sets.</h2>
          </div>

          <div className="routine-tabs" role="tablist" aria-label="Routine options">
            {routines.map((item) => (
              <button
                key={item.id}
                className={activeRoutine === item.id ? "routine-tab is-active" : "routine-tab"}
                type="button"
                role="tab"
                aria-selected={activeRoutine === item.id}
                onClick={() => setActiveRoutine(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="routine-board">
            <div className="routine-copy">
              <p className="eyebrow">Selected set</p>
              <h3>{routine.title}</h3>
              <p>
                {routineProducts.length} catalog products grouped into a clearer
                sales path for staff, clinics, and customers.
              </p>
            </div>
            <div className="routine-products">
              {routineProducts.map((product, index) => (
                <button key={product.id} type="button" onClick={() => setSelectedProduct(product)}>
                  <span>{index + 1}</span>
                  <img src={asset(product.image)} alt="" loading="lazy" />
                  <strong>{product.name}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="professional-strip" id="professional" aria-labelledby="professional-title">
          <div>
            <p className="eyebrow">Professional shelf</p>
            <h2 id="professional-title">Mesotherapy and peels get their own focused path.</h2>
          </div>
          <div className="protocol-grid">
            <div>
              <FlaskConical size={24} />
              <strong>Peelings</strong>
              <span>Multipeel Pre-Fluid and Gel-Serum</span>
            </div>
            <div>
              <Sparkles size={24} />
              <strong>Mesotherapy</strong>
              <span>Lighten, Repair, and 3 in 1 liquids</span>
            </div>
            <div>
              <SunMedium size={24} />
              <strong>Finish</strong>
              <span>Hydro Protector SPF-30 and barrier-support creams</span>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="section-heading">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title">Direct contact details from the current LUNAR site.</h2>
          </div>

          <div className="contact-grid">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
              <Phone size={22} />
              <span>Telephone</span>
              <strong>{CONTACT.phone}</strong>
            </a>
            <a href={`tel:${CONTACT.mobile.replace(/\s/g, "")}`}>
              <MessageCircle size={22} />
              <span>Mobile</span>
              <strong>{CONTACT.mobile}</strong>
            </a>
            <div>
              <ExternalLink size={22} />
              <span>Address</span>
              <strong>{CONTACT.address}</strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>LUNAR Cosmetics</span>
        <span>Product data and images checked against lunar.ps on July 6, 2026.</span>
        <div>
          <a href={CONTACT.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </footer>

      <aside className={drawerOpen ? "drawer is-open" : "drawer"} aria-hidden={!drawerOpen}>
        <button className="drawer-scrim" type="button" aria-label="Close inquiry drawer" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div className="drawer-head">
            <div>
              <p className="eyebrow">Inquiry</p>
              <h2 id="drawer-title">Selected products</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}>
              <X size={19} />
            </button>
          </div>

          <div className="drawer-body">
            {selectedProducts.length === 0 ? (
              <p className="empty-state">No products selected.</p>
            ) : (
              selectedProducts.map((product) => (
                <div className="drawer-item" key={product.id}>
                  <img src={asset(product.image)} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      SKU {product.sku} / {product.priceLabel}
                    </span>
                  </div>
                  <button type="button" onClick={() => toggleInquiry(product.id)} aria-label={`Remove ${product.name}`}>
                    <X size={17} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="drawer-foot">
            <div className="drawer-total">
              <span>Priced subtotal</span>
              <strong>{fixedPriceSubtotal} ₪</strong>
            </div>
            <a className="primary-action" href={selectedProducts.length ? whatsappUrl : "#catalog"} target="_blank" rel="noreferrer">
              <MessageCircle size={18} />
              WhatsApp inquiry
            </a>
            <button className="secondary-action" type="button" disabled={!selectedProducts.length} onClick={copyInquiry}>
              {copied ? <Check size={18} /> : <ShoppingBag size={18} />}
              {copied ? "Copied" : "Copy list"}
            </button>
          </div>
        </div>
      </aside>

      {selectedProduct ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <button className="modal-scrim" type="button" aria-label="Close product details" onClick={() => setSelectedProduct(null)} />
          <article className="modal-panel">
            <button className="icon-button modal-close" type="button" aria-label="Close" onClick={() => setSelectedProduct(null)}>
              <X size={19} />
            </button>
            <div className="modal-image">
              <img src={asset(selectedProduct.image)} alt={selectedProduct.name} />
            </div>
            <div className="modal-copy">
              <p className="eyebrow">{selectedProduct.sourceCategory}</p>
              <h2 id="product-modal-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <dl>
                <div>
                  <dt>SKU</dt>
                  <dd>{selectedProduct.sku}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{selectedProduct.size}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{selectedProduct.priceLabel}</dd>
                </div>
              </dl>
              <div className="tag-row">
                {selectedProduct.concerns.map((concern) => (
                  <span key={concern}>{concern}</span>
                ))}
              </div>
              <div className="modal-actions">
                <button className="add-action" type="button" onClick={() => toggleInquiry(selectedProduct.id)}>
                  <ShoppingBag size={17} />
                  {inquiryIds.has(selectedProduct.id) ? "Remove from inquiry" : "Add to inquiry"}
                </button>
                <a className="ghost-action" href={selectedProduct.detailUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} />
                  Source page
                </a>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

export default App;
