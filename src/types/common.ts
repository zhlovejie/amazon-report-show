
/**
 * 销售报表字段说明
 */
const ORDER_HEADER_KEYS_OBJECT = {
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
    zhCn: "商品销售收入	商品售价 × 数量",
  },
  productSalesTax: {
    key: "product sales tax",
    zhCn: "商品销售税",
  },
  shippingCredits: {
    key: "shipping credits",
    zhCn: "运费补贴	买家支付的运费",
  },
  shippingCreditsTax: {
    key: "shipping credits tax",
    zhCn: "运费补贴的税款",
  },
  giftWrapCredits: {
    key: "gift wrap credits",
    zhCn: "礼品包装费	买家支付的礼品包装费",
  },
  giftWrapCreditsTax: {
    key: "giftwrap credits tax",
    zhCn: "礼品包装费的税款",
  },

  RegulatoryFee: {
    key: "Regulatory Fee",
    zhCn: "监管费（特定品类如电子设备）",
  },

  TaxOnRegulatoryFee: {
    key: "Tax On Regulatory Fee",
    zhCn: "监管费的税款",
  },

  promotionalRebates: {
    key: "promotional rebates",
    zhCn: "促销折扣	优惠券、促销活动的金额",
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
    zhCn: "销售佣金	亚马逊按品类收取的佣金（通常8-15%）",
  },

  fbaFees: {
    key: "fba fees",
    zhCn: "FBA费用	包括仓储费、配送费、处理费等",
  },
  otherTransactionFees: {
    key: "other transaction fees",
    zhCn: "其他交易费	如结账手续费、高额标签费等",
  },
  other: {
    key: "other",
    zhCn: "其他费用	退款管理费、长期仓储费等",
  },
  total: {
    key: "total",
    zhCn: "净结算金额	最终存入卖家账户的金额",
  },
} as const;

/**
 * 仓储报表字段说明
 */
const STORAGE_HEADER_KEYS_OBJECT = {
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
    zhCn: "最长边尺寸	单位根据 measurement_units",
  },

  medianSide: {
    key: "median_side",
    zhCn: "中间边尺寸	三边中的中间值",
  },
  shortestSide: {
    key: "shortest_side",
    zhCn: "最短边尺寸	三边中的最小值",
  },

  measurementUnits: {
    key: "measurement_units",
    zhCn: "尺寸单位	inches, centimeters",
  },

  weight: {
    key: "weight",
    zhCn: "商品重量	含包装重量",
  },

  weightUnits: {
    key: "weight_units",
    zhCn: "重量单位	pounds, kilograms",
  },
  itemVolume: {
    key: "item_volume",
    zhCn: "单件体积	长×宽×高",
  },
  volumeUnits: {
    key: "volume_units",
    zhCn: "体积单位	cubic inches, cubic feet",
  },

  productSizeTier: {
    key: "product_size_tier",
    zhCn: "商品尺寸层级	见下方尺寸层级表",
  },

  averageQuantityOnHand: {
    key: "average_quantity_on_hand",
    zhCn: "平均在库数量	月平均库存量",
  },

  averageQuantityPendingRemoval: {
    key: "average_quantity_pending_removal",
    zhCn: "待移除平均数量	计划移除的库存",
  },

  estimatedTotalItemVolume: {
    key: "estimated_total_item_volume",
    zhCn: "预估总库存体积	在库数量 × 单件体积",
  },

  monthOfCharge: {
    key: "month_of_charge",
    zhCn: "计费月份",
  },

  storageUtilizationRatio: {
    key: "storage_utilization_ratio",
    zhCn: "仓储利用率比率	当前使用率",
  },

  storageUtilizationRatioUnits: {
    key: "storage_utilization_ratio_units",
    zhCn: "利用率单位	percentage",
  },

  baseRate: {
    key: "base_rate",
    zhCn: "基础费率	每立方英尺/月",
  },

  utilizationSurchargeRate: {
    key: "utilization_surcharge_rate",
    zhCn: "利用率附加费率	超量存储附加费",
  },

  avgQtyForSus: {
    key: "avg_qty_for_sus",
    zhCn: "超量存储附加费计算数量	超量部分库存",
  },

  estVolForSus: {
    key: "est_vol_for_sus",
    zhCn: "超量存储附加费计算体积	超量数量 × 单件体积",
  },

  estBaseMsf: {
    key: "est_base_msf",
    zhCn: "预估基础月仓储费	基础费率 × 总库存体积",
  },

  estSus: {
    key: "est_sus",
    zhCn: "预估超量存储附加费	附加费率 × 超量体积",
  },

  currency: {
    key: "currency",
    zhCn: "货币",
  },

  estimatedMonthlyStorageFee: {
    key: "estimated_monthly_storage_fee",
    zhCn: "预估月仓储费	关键费用字段",
  },

  dangerousGoodsStorageType: {
    key: "dangerous_goods_storage_type",
    zhCn: "危险品存储类型	flammable, corrosive",
  },

  eligibleForInventoryDiscount: {
    key: "eligible_for_inventory_discount",
    zhCn: "是否有资格享受库存折扣	TRUE/FALSE",
  },

  qualifiesForInventoryDiscount: {
    key: "qualifies_for_inventory_discount",
    zhCn: "是否符合库存折扣条件	TRUE/FALSE",
  },

  totalIncentiveFeeAmount: {
    key: "total_incentive_fee_amount",
    zhCn: "总激励费用金额	正数为奖励，负数为费用",
  },

  breakdownIncentiveFeeAmount: {
    key: "breakdown_incentive_fee_amount",
    zhCn: "激励费用明细分解	JSON格式明细",
  },

  averageQuantityCustomerOrders: {
    key: "average_quantity_customer_orders",
    zhCn: "月均客户订单数量	销售活跃度指标",
  },
} as const;

/**
 * 指定报表的哪些列需要处理货币类型转换
 */
export const CURRENCY_FORMATTER_OBJECT = {
  'order':['quantity','product sales','selling fees','fba fees','other transaction fees','other','total'],
  'storage':['estimated_monthly_storage_fee'],
  'advertisement':[]
}


// 工具类型：获取对象所有值的某个属性的联合类型
type ValueOfProperty<
  T extends Record<string, Record<string, any>>,
  P extends string
> = {
  [K in keyof T]: T[K][P];
}[keyof T];

type OrderHeaderKeyType = ValueOfProperty<
  typeof ORDER_HEADER_KEYS_OBJECT,
  "key"
>;

type StorageHeaderKeyType = ValueOfProperty<
  typeof STORAGE_HEADER_KEYS_OBJECT,
  "key"
>;

export type OrderHeaderKeyTypeObject = {
  [K in OrderHeaderKeyType]: string;
}&{
  __status:'pending' | 'done'
};

export type StorageHeaderKeyTypeObject = {
  [K in StorageHeaderKeyType]: string;
}&{
  __status:'pending' | 'done'
};

export type ReportCalcConstructorParams = {
  orderData: Array<OrderHeaderKeyTypeObject>;
  storageData: Array<StorageHeaderKeyTypeObject>;
};

type ReprotItemKnowKeys = {
  -readonly [K in keyof typeof ORDER_HEADER_KEYS_OBJECT]?: string;
};

export type ReprotItem = ReprotItemKnowKeys & {
   "__no":number,
    "__name": string,
    "__fnsku": string,
    "__asin": string,
    "__sku": string,
    [key: string]: string | number | boolean | undefined  // 直接在这里添加索引签名
};

export type ReportObjectType = {
  [key: string]: ReprotItem | {};
};

export type CallbackPrams = {
  status: "ok" | "error";
  message?:string;
  orderData?:Array<any>;
  storageData?:Array<any>;
  adsData?:AdvertisingBillData
}



/**
 * 账单汇总金额信息
 */
interface StatementSummaryTotals {
  /** 总广告活动费用 */
  total_campaign_charges: number;
  /** 总调整金额 */
  total_adjustments: number;
  /** 总监管广告费 */
  total_regulatory_advertising_fees: number;
  /** 小计金额 */
  sub_total: number;
  /** 应付总金额 */
  total_amount_due: number;
}

/**
 * 单个广告活动详情
 */
interface CampaignDetail {
  /** 广告活动名称 */
  campaign_name: string;
  /** 广告活动类型 */
  campaign_type: string;
  /** 广告活动ID */
  campaign_id: string;
  /** 不含税金额 */
  amount_ex_tax: number;
  /** 发票ID */
  invoice_id: string;
}

/**
 * 单个国家的广告活动详情
 */
interface SingleCountryCampaignDetails {
  /** 国家名称 */
  country_name: string;
  /** 总广告活动费用 */
  total_campaign_charges: number;
  /** 广告活动详情表格数据 */
  campaign_details_table: CampaignDetail[];
  /** 广告活动费用详情总计 */
  campaign_charge_details_total: number;
}

/**
 * 广告账单数据主接口
 */
export interface AdvertisingBillData {
  /** 账单汇总信息 */
  statement_summary_totals: StatementSummaryTotals;
  /** 单个国家广告活动详情 */
  single_country_campaign_details: SingleCountryCampaignDetails;
}


export interface ResultAdvertisingBillData {
  "success": true | false,
  "data":AdvertisingBillData | null,
  "message"?:string,
  "raw_text"?:string
}
