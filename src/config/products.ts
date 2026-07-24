import type { ProductConfig } from "@/types/product";
import type { RawOrderRow, RawStorageRow } from "@/types/report-source";

export interface UnrecognizedProductReference {
  source: "order" | "storage";
  field: "__sku" | "__fnsku";
  value: string;
}

export const PRODUCT_LIST_STORAGE_KEY = "amazon-report-show:products:v1";

export const DEFAULT_PRODUCT_LIST: ProductConfig[] = [
  {
    __no: 1,
    __name: "门后-单黑",
    __fnsku: "X003IDW07X",
    __asin: "B0BMF6VST8",
    __sku: "hook01",
    __ads: ["门后衣架-基础自动广告", "手动over the door hook"],
    __coupon: [
      "Black Over the Door Hanger",
      "black on over the door hanger",
      "over the door hanger",
    ],
    __default_extra_purchase_price: "14.8",
    __default_extra_weight: "840",
    __default_extra_inside_express_price: "1",
    __default_extra_shipping_price: "7",
    __category: "门后",
  },
  {
    __no: 2,
    __name: "门后-孖黑",
    __fnsku: "X003TKCFCF",
    __asin: "B0C538JL1X",
    __sku: "hook02",
    __ads: [],
    __coupon: ["2 Pack Door Hanger", "2 pack door hanger"],
    __default_extra_purchase_price: "29.4",
    __default_extra_weight: "970",
    __default_extra_inside_express_price: "1.5",
    __default_extra_shipping_price: "7",
    __category: "门后",
  },
  {
    __no: 3,
    __name: "门后-单白",
    __fnsku: "X0048XOI7H",
    __asin: "B0D4MCXCC6",
    __sku: "hook01-white",
    __ads: [],
    __coupon: ["White Over the Door Hanger", "over the door towel rack"],
    __default_extra_purchase_price: "14.8",
    __default_extra_weight: "840",
    __default_extra_inside_express_price: "1",
    __default_extra_shipping_price: "7",
    __category: "门后",
  },
  {
    __no: 4,
    __name: "T18褐色",
    __fnsku: "X004EJ05W7",
    __asin: "B0DHL54ZV4",
    __sku: "T-tie-red01",
    __ads: ["T18自动广告活动"],
    __coupon: [
      "tie rack hanger for closet",
      "Tie Rack Hanger for Closet",
      "Tie Hangers for Men",
    ],
    __default_extra_purchase_price: "7",
    __default_extra_weight: "170",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "T18",
  },
  {
    __no: 5,
    __name: "T18黑",
    __fnsku: "X004EJ051D",
    __asin: "B0DHQ8QGQG",
    __sku: "T-tie-black01",
    __ads: ["T18-手动精准-推Tie Hanger"],
    __coupon: ["tie organizer for men"],
    __default_extra_purchase_price: "7",
    __default_extra_weight: "170",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "T18",
  },
  {
    __no: 6,
    __name: "T18褐双",
    __fnsku: "X004Q4DZLX",
    __asin: "B0FDFSKK4L",
    __sku: "T-tie-red002",
    __ads: [],
    __coupon: [],
    __default_extra_purchase_price: "14",
    __default_extra_weight: "340",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "T18",
  },
  {
    __no: 7,
    __name: "T18-双黑",
    __fnsku: "X0051YWC8T",
    __asin: "B0GVB2KCGZ",
    __sku: "T-tie-blk002",
    __ads: [],
    __coupon: [],
    __default_extra_purchase_price: "14",
    __default_extra_weight: "340",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "T18",
  },

  {
    __no: 8,
    __name: "双14墙挂黑",
    __fnsku: "X004DAC1AV",
    __asin: "B0DDXB7T2H",
    __sku: "tie-wall-02black",
    __ads: [
      "2Pack Wall Mounted Tie Rack Black",
      "墙挂14钩-手动-tie wall closet",
    ],
    __coupon: [],
    __default_extra_purchase_price: "14.5",
    __default_extra_weight: "370",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "墙14",
  },
  {
    __no: 9,
    __name: "双14墙挂白",
    __fnsku: "X004DA8SY9",
    __asin: "B0DDX41KTY",
    __sku: "tie-wall-02white",
    __ads: ["2Pack Wall Mounted Tie Rack White"],
    __coupon: [],
    __default_extra_purchase_price: "14.5",
    __default_extra_weight: "370",
    __default_extra_inside_express_price: "0.3",
    __default_extra_shipping_price: "7",
    __category: "墙14",
  },
];

const cloneProducts = (products: ProductConfig[]) =>
  products.map((product) => ({
    ...product,
    __ads: [...product.__ads],
    __coupon: [...product.__coupon],
  }));

function normalizeProduct(value: unknown, index: number): ProductConfig | null {
  if (!value || typeof value !== "object") return null;

  const product = value as Partial<ProductConfig>;
  const sku = String(product.__sku ?? "").trim();
  const name = String(product.__name ?? "").trim();
  if (!sku || !name) return null;

  return {
    __no: Number.isFinite(Number(product.__no))
      ? Number(product.__no)
      : index + 1,
    __name: name,
    __fnsku: String(product.__fnsku ?? "").trim(),
    __asin: String(product.__asin ?? "").trim(),
    __sku: sku,
    __ads: Array.isArray(product.__ads)
      ? product.__ads
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    __coupon: Array.isArray(product.__coupon)
      ? product.__coupon
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    __default_extra_purchase_price: String(
      product.__default_extra_purchase_price ?? "0",
    ),
    __default_extra_weight: String(product.__default_extra_weight ?? "0"),
    __default_extra_inside_express_price: String(
      product.__default_extra_inside_express_price ?? "0",
    ),
    __default_extra_shipping_price: String(
      product.__default_extra_shipping_price ?? "7",
    ),
    __category: String(product.__category ?? "未分类").trim() || "未分类",
  };
}

export function loadProductList(): ProductConfig[] {
  const defaults = cloneProducts(DEFAULT_PRODUCT_LIST);
  if (typeof window === "undefined") return defaults;

  try {
    const saved = window.localStorage.getItem(PRODUCT_LIST_STORAGE_KEY);
    if (!saved) return defaults;

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaults;

    const normalized = parsed
      .map(normalizeProduct)
      .filter((product): product is ProductConfig => product !== null);
    const savedBySku = new Map(
      normalized.map((product) => [product.__sku, product]),
    );
    const defaultSkus = new Set(defaults.map((product) => product.__sku));

    // 按分类分组：同分类产品排在一起，分类内按 __no 排序
    const merged = [
      ...defaults.map((product) => savedBySku.get(product.__sku) ?? product),
      ...normalized.filter((product) => !defaultSkus.has(product.__sku)),
    ].sort((a, b) => {
      const categoryCompare = a.__category.localeCompare(b.__category, "zh-CN");
      if (categoryCompare !== 0) return categoryCompare;
      return a.__no - b.__no;
    });
    return merged;
  } catch {
    return defaults;
  }
}

export function saveProductList(products: ProductConfig[]) {
  window.localStorage.setItem(
    PRODUCT_LIST_STORAGE_KEY,
    JSON.stringify(products),
  );
}

export function isDefaultProduct(sku: string) {
  return DEFAULT_PRODUCT_LIST.some((product) => product.__sku === sku);
}

export function getDefaultProduct(sku: string) {
  const product = DEFAULT_PRODUCT_LIST.find((item) => item.__sku === sku);
  return product ? cloneProducts([product])[0] : undefined;
}

export function findUnrecognizedProducts(
  orderData: Array<Pick<RawOrderRow, "type" | "sku">>,
  storageData: Array<Pick<RawStorageRow, "fnsku">>,
  products: ProductConfig[],
) {
  const configuredSkus = new Set(
    products.map((product) => product.__sku.trim()),
  );
  const configuredFnskus = new Set(
    products.map((product) => product.__fnsku.trim()).filter(Boolean),
  );
  const orderSkus = [
    ...new Set(
      orderData
        .filter((row) => String(row.type).trim().toLowerCase() === "order")
        .map((row) => String(row.sku).trim())
        .filter((sku) => sku && !configuredSkus.has(sku)),
    ),
  ];
  const storageFnskus = [
    ...new Set(
      storageData
        .map((row) => String(row.fnsku).trim())
        .filter((fnsku) => fnsku && !configuredFnskus.has(fnsku)),
    ),
  ];

  return [
    ...orderSkus.map(
      (value): UnrecognizedProductReference => ({
        source: "order",
        field: "__sku",
        value,
      }),
    ),
    ...storageFnskus.map(
      (value): UnrecognizedProductReference => ({
        source: "storage",
        field: "__fnsku",
        value,
      }),
    ),
  ];
}
