/**
 * Columns exposed by Amazon's settlement transaction report.
 */
export const ORDER_HEADER_KEYS = {
  dateTime: {
    key: "date/time",
    zhCn: "交易发生的日期和时间",
  },
  settlementId: {
    key: "settlement id",
    zhCn: "结算批次ID，每次结算的唯一标识",
  },
  type: {
    key: "type",
    zhCn: "交易类型（订单、退款、服务费、调整等）",
  },
  orderId: {
    key: "order id",
    zhCn: "亚马逊订单编号",
  },
  sku: {
    key: "sku",
    zhCn: "卖家自定义的商品库存单位",
  },
  description: {
    key: "description",
    zhCn: "交易描述（商品名称、费用类型等）",
  },
  quantity: {
    key: "quantity",
    zhCn: "商品数量（正数=销售，负数=退款）",
  },
  marketplace: {
    key: "marketplace",
    zhCn: "交易发生的亚马逊站点",
  },
  accountType: {
    key: "account type",
    zhCn: "买家账户类型",
  },
  fulfillment: {
    key: "fulfillment",
    zhCn: "配送方式",
  },
  orderCity: {
    key: "order city",
    zhCn: "买家所在城市",
  },
  orderState: {
    key: "order state",
    zhCn: "买家所在州/省",
  },
  orderPostal: {
    key: "order postal",
    zhCn: "买家邮政编码",
  },
  taxCollectionModel: {
    key: "tax collection model",
    zhCn: "亚马逊税务计算服务模型",
  },
  productSales: {
    key: "product sales",
    zhCn: "商品销售收入\t商品售价 × 数量",
  },
  productSalesTax: {
    key: "product sales tax",
    zhCn: "商品销售税",
  },
  shippingCredits: {
    key: "shipping credits",
    zhCn: "运费补贴\t买家支付的运费",
  },
  shippingCreditsTax: {
    key: "shipping credits tax",
    zhCn: "运费补贴的税款",
  },
  giftWrapCredits: {
    key: "gift wrap credits",
    zhCn: "礼品包装费\t买家支付的礼品包装费",
  },
  giftWrapCreditsTax: {
    key: "giftwrap credits tax",
    zhCn: "礼品包装费的税款",
  },
  regulatoryFee: {
    key: "Regulatory Fee",
    zhCn: "监管费（特定品类如电子设备）",
  },
  taxOnRegulatoryFee: {
    key: "Tax On Regulatory Fee",
    zhCn: "监管费的税款",
  },
  promotionalRebates: {
    key: "promotional rebates",
    zhCn: "促销折扣\t优惠券、促销活动的金额",
  },
  promotionalRebatesTax: {
    key: "promotional rebates tax",
    zhCn: "促销折扣的税款",
  },
  marketplaceWithheldTax: {
    key: "marketplace withheld tax",
    zhCn: "亚马逊代扣代缴的税款",
  },
  sellingFees: {
    key: "selling fees",
    zhCn: "销售佣金\t亚马逊按品类收取的佣金（通常8-15%）",
  },
  fbaFees: {
    key: "fba fees",
    zhCn: "FBA费用\t包括仓储费、配送费、处理费等",
  },
  otherTransactionFees: {
    key: "other transaction fees",
    zhCn: "其他交易费\t如结账手续费、高额标签费等",
  },
  other: {
    key: "other",
    zhCn: "其他费用\t退款管理费、长期仓储费等",
  },
  total: {
    key: "total",
    zhCn: "净结算金额\t最终存入卖家账户的金额",
  },
} as const;

/**
 * Columns exposed by Amazon's monthly storage fee report.
 */
export const STORAGE_HEADER_KEYS = {
  asin: {
    key: "asin",
    zhCn: "亚马逊标准识别号",
  },
  fnsku: {
    key: "fnsku",
    zhCn: "FBA商品编码",
  },
  productName: {
    key: "product_name",
    zhCn: "商品名称",
  },
  fulfillmentCenter: {
    key: "fulfillment_center",
    zhCn: "存放的FBA仓库",
  },
  countryCode: {
    key: "country_code",
    zhCn: "国家代码",
  },
  longestSide: {
    key: "longest_side",
    zhCn: "最长边尺寸\t单位根据 measurement_units",
  },
  medianSide: {
    key: "median_side",
    zhCn: "中间边尺寸\t三边中的中间值",
  },
  shortestSide: {
    key: "shortest_side",
    zhCn: "最短边尺寸\t三边中的最小值",
  },
  measurementUnits: {
    key: "measurement_units",
    zhCn: "尺寸单位\tinches, centimeters",
  },
  weight: {
    key: "weight",
    zhCn: "商品重量\t含包装重量",
  },
  weightUnits: {
    key: "weight_units",
    zhCn: "重量单位\tpounds, kilograms",
  },
  itemVolume: {
    key: "item_volume",
    zhCn: "单件体积\t长×宽×高",
  },
  volumeUnits: {
    key: "volume_units",
    zhCn: "体积单位\tcubic inches, cubic feet",
  },
  productSizeTier: {
    key: "product_size_tier",
    zhCn: "商品尺寸层级\t见下方尺寸层级表",
  },
  averageQuantityOnHand: {
    key: "average_quantity_on_hand",
    zhCn: "平均在库数量\t月平均库存量",
  },
  averageQuantityPendingRemoval: {
    key: "average_quantity_pending_removal",
    zhCn: "待移除平均数量\t计划移除的库存",
  },
  estimatedTotalItemVolume: {
    key: "estimated_total_item_volume",
    zhCn: "预估总库存体积\t在库数量 × 单件体积",
  },
  monthOfCharge: {
    key: "month_of_charge",
    zhCn: "计费月份",
  },
  storageUtilizationRatio: {
    key: "storage_utilization_ratio",
    zhCn: "仓储利用率比率\t当前使用率",
  },
  storageUtilizationRatioUnits: {
    key: "storage_utilization_ratio_units",
    zhCn: "利用率单位\tpercentage",
  },
  baseRate: {
    key: "base_rate",
    zhCn: "基础费率\t每立方英尺/月",
  },
  utilizationSurchargeRate: {
    key: "utilization_surcharge_rate",
    zhCn: "利用率附加费率\t超量存储附加费",
  },
  avgQtyForSus: {
    key: "avg_qty_for_sus",
    zhCn: "超量存储附加费计算数量\t超量部分库存",
  },
  estVolForSus: {
    key: "est_vol_for_sus",
    zhCn: "超量存储附加费计算体积\t超量数量 × 单件体积",
  },
  estBaseMsf: {
    key: "est_base_msf",
    zhCn: "预估基础月仓储费\t基础费率 × 总库存体积",
  },
  estSus: {
    key: "est_sus",
    zhCn: "预估超量存储附加费\t附加费率 × 超量体积",
  },
  currency: {
    key: "currency",
    zhCn: "货币",
  },
  estimatedMonthlyStorageFee: {
    key: "estimated_monthly_storage_fee",
    zhCn: "预估月仓储费\t关键费用字段",
  },
  dangerousGoodsStorageType: {
    key: "dangerous_goods_storage_type",
    zhCn: "危险品存储类型\tflammable, corrosive",
  },
  eligibleForInventoryDiscount: {
    key: "eligible_for_inventory_discount",
    zhCn: "是否有资格享受库存折扣\tTRUE/FALSE",
  },
  qualifiesForInventoryDiscount: {
    key: "qualifies_for_inventory_discount",
    zhCn: "是否符合库存折扣条件\tTRUE/FALSE",
  },
  totalIncentiveFeeAmount: {
    key: "total_incentive_fee_amount",
    zhCn: "总激励费用金额\t正数为奖励，负数为费用",
  },
  breakdownIncentiveFeeAmount: {
    key: "breakdown_incentive_fee_amount",
    zhCn: "激励费用明细分解\tJSON格式明细",
  },
  averageQuantityCustomerOrders: {
    key: "average_quantity_customer_orders",
    zhCn: "月均客户订单数量\t销售活跃度指标",
  },
} as const;

export const REPORT_FILE_TYPES = ["order", "storage", "ads"] as const;

export type ReportFileType = (typeof REPORT_FILE_TYPES)[number];

export type CsvReportFileType = Exclude<ReportFileType, "ads">;

/** Numeric columns normalized from formatted strings during CSV import. */
export const NUMERIC_COLUMNS_BY_REPORT = {
  order: [
    "quantity",
    "product sales",
    "selling fees",
    "fba fees",
    "other transaction fees",
    "other",
    "total",
  ],
  storage: ["estimated_monthly_storage_fee"],
} as const satisfies Record<CsvReportFileType, readonly string[]>;

/** @deprecated Use `NUMERIC_COLUMNS_BY_REPORT`. */
export const CURRENCY_FORMATTER_OBJECT = {
  ...NUMERIC_COLUMNS_BY_REPORT,
  ads: [],
} as const;

type ValueOfProperty<
  T extends Record<string, Record<string, unknown>>,
  P extends string,
> = {
  [K in keyof T]: T[K][P];
}[keyof T];

type CsvStringRow<K extends string> = {
  [P in K]: string;
};

export type OrderHeaderKey = ValueOfProperty<typeof ORDER_HEADER_KEYS, "key">;

export type StorageHeaderKey = ValueOfProperty<
  typeof STORAGE_HEADER_KEYS,
  "key"
>;

export type RowStatus = "pending" | "done";

export interface RowMeta {
  __status: RowStatus;
  __key: number | string;
}

export type RawOrderRow = CsvStringRow<OrderHeaderKey>;

export type RawStorageRow = CsvStringRow<StorageHeaderKey>;

export type TrackedOrderRow = RawOrderRow & RowMeta;

export type TrackedStorageRow = RawStorageRow & RowMeta;
