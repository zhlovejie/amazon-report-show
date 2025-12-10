import _ from "lodash";
import Decimal from "decimal.js";
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

type OrderHeaderKeyTypeObject = {
  [K in OrderHeaderKeyType]: string;
};

type StorageHeaderKeyTypeObject = {
  [K in StorageHeaderKeyType]: string;
};

type ReportCalcConstructorParams = {
  orderData: Array<OrderHeaderKeyTypeObject>;
  storageData: Array<StorageHeaderKeyTypeObject>;
};

type ReprotItemKnowKeys = {
  -readonly [K in keyof typeof ORDER_HEADER_KEYS_OBJECT]?: string;
};

type ReprotItemAdditionalKeys = {
  [key: string]: string | number;
};

type ReprotItem = ReprotItemKnowKeys & ReprotItemAdditionalKeys;

type ReportObjectType = {
  [key: string]: ReprotItem;
};

/**
 * 一月 - January (Jan)
二月 - February (Feb)
三月 - March (Mar)
四月 - April (Apr)
五月 - May (May)
六月 - June (Jun)
七月 - July (Jul)
八月 - August (Aug)
九月 - September (Sep)
十月 - October (Oct)
十一月 - November (Nov)
十二月 - December (Dec)
 */

/**
 * 计算报表类
 */
class ReportCalc {
  orderData: Array<OrderHeaderKeyTypeObject> = [];
  storageData: Array<StorageHeaderKeyTypeObject> = [];
  skuList: Array<string> = [];

  //  记录报表类型处理进度
  typeList = {} as { [key: string]: boolean };
  report: ReportObjectType = {};

  // type Order_Retrocharge Refund_Retrocharge 先保存下来，待处理
  OrderRetrochargeTypeAndRefundRetrochargeType:Array<OrderHeaderKeyTypeObject> = []

  // type Amazon Fees 先保存下来，待处理
  AmazonFees:Array<OrderHeaderKeyTypeObject> = []
  // 仓储费 先保存下来，待处理
  FBAInventoryFee:Array<OrderHeaderKeyTypeObject> = []

  constructor({ orderData, storageData }: ReportCalcConstructorParams) {
    this.orderData = orderData;
    this.storageData = storageData;
  }

  init() {
    this.initSku();
    this.initCalc();
  }

  /**
   * 记录报表中的 sku，type 防止计算遗漏
   */
  initSku() {
    let that = this;

    const _skuList = that.orderData.map((item) => {
      return item.sku;
    });

    //  几个sku
    that.skuList = [...new Set(_skuList)].filter(
      (sku) => String(sku).length > 0
    );

    const _typeList = that.orderData.map((item) => {
      return item.type;
    });

    //  几个type
    [...new Set(_typeList)].map((type) => {
      that.typeList[type] = false;
    });

    that.skuList.map((sku) => {
      that.report[sku] = {};
    });

    console.log(`init skus : ${that.skuList.toString()}`);

    console.log(`init type : ${that.typeList.toString()}`);
  }

  initCalc() {
    let that = this;
    that.skuList.map((sku) => {
      that.initOrderType(sku);
      that.initRefundType(sku);

      //  广告费
      //  优惠券
      //  广告占比  (广告费 + 优惠券) / 销售额

      
      that.initAdjustmentType(sku)
      that.initLiquidationsAndLiquidationsAdjustments(sku)
      

    });

    that.initOrderRetrochargeAndRefundRetrocharge()
    that.initAmazonFees()
    that.initServiceFee()
    that.initFBAInventoryFee()
    console.log(that.report);
    // let key = ORDER_HEADER_KEYS_OBJECT.sku.key as keyof OrderHeaderKeyType;
  }

  /**
   * 
   * 含义：客户订单收入。
   * 详细解释：这是最核心的收入项。当顾客下单购买您的商品并完成付款时，这笔订单的销售额（商品售价+运费+礼品包装费）会记录在此。
   * 需要注意的是，这只是一个“毛收入”，尚未扣除任何费用（如亚马逊佣金、FBA费用等）。
   * 一个Order项通常会对应着后续的几个扣费项（如Service Fee）。
   */
  initOrderType(sku: string) {
    let that = this;
    let orderTypeList = that.orderData.filter(
      (item) => item.sku === sku && item.type.toLocaleLowerCase().trim() === "order"
    );

    //  销量
    let qty = orderTypeList.reduce((initVal, item) => {
      return initVal.add(Decimal(item.quantity));
    }, Decimal(0));

    that.report[sku]["qty"] = qty.toFixed(0);

    //  销售额
    let productSales = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["product sales"]);
    }, Decimal(0));

    that.report[sku]["productSales"] = productSales.toFixed(2);

    //  佣金
    let sellingFees = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["selling fees"]);
    }, Decimal(0));

    that.report[sku]["sellingFees"] = sellingFees.toFixed(2);

    //  FBA配送费
    let fbaFees = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["fba fees"]);
    }, Decimal(0));

    that.report[sku]["fbaFees"] = fbaFees.toFixed(2);

    //  order type 处理完成
    that.typeList["Order"] = true;
    // console.warn(`order type sku:${sku} ${orderTypeList.length}条记录`)
  }

  /**
   * 
   * 给客户的退款。
   * 详细解释：当您（或亚马逊代表您）向客户退款时，记录在此。它会冲减您的销售收入。
   * 通常，与这笔退款相关的亚马逊佣金和FBA费用也会部分或全部退还，但这些费用的退还通常会体现在 Service Fee 或其他费用项中，而不是直接体现在 Refund 里。Refund 本身代表的是退还给客户的商品金额。
   */
  initRefundType(sku: string) {
    let that = this;
    let refundTypeList = that.orderData.filter(
      (item) => item.sku === sku && item.type.toLocaleLowerCase().trim() === "refund"
    );

    //  退款金额
    let refundAmount = refundTypeList.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    that.report[sku]["refund"] = refundAmount.toFixed(2);

    //  退款数量
    let refundQty = refundTypeList.reduce((initVal, item) => {
      return initVal.add(item.quantity);
    }, Decimal(0));

    that.report[sku]["refundQty"] = refundQty.toFixed(2);

    
    //  退货率= 退货数量 / 销售数量 * 100
    const sellsQty = Decimal(that.report[sku]["qty"])
    if(sellsQty.isZero()){ // 除数为零情况
      that.report[sku]["refundRate"] = Decimal(0).toFixed(2)
    }else{
      that.report[sku]["refundRate"] = refundQty
        .div(sellsQty)
        .mul(100)
        .toFixed(2);
    }

    //  Refund type 处理完成
    that.typeList["Refund"] = true;
    // console.warn(`order type sku:${sku} ${refundTypeList.length}条记录`)
  }

  /**
   * Order_Retrocharge
   * 含义：订单的后期收费。
   * 详细解释：亚马逊在订单完成（已付款、已发货）一段时间后，因某种原因追加收取的费用。
   * 最常见的情况是“配送重量/尺寸重新测量”：如果亚马逊在后续核查中发现商品的实际重量或尺寸大于您创建货件时提供的数据，他们会根据正确的数据重新计算FBA配送费，并追收差额。这笔追收的费用就体现在这里。
   * 
   * Refund_Retrocharge
   * 含义：退款的后期追回。
   * 详细解释：与 Order_Retrocharge 类似，但针对的是退款。
   * 例如，在给客户退款时，亚马逊先退还了您全部的FBA配送费。
   * 但后来发现该商品不符合全额退费条件（如因买家过错导致退货），亚马逊会追回部分已退还的费用。这笔追回的费用就记录在此项下。
   */
  initOrderRetrochargeAndRefundRetrocharge(){
    //Order_Retrocharge
    //Refund_Retrocharge

    let that = this;
    that.OrderRetrochargeTypeAndRefundRetrochargeType = that.orderData.filter(
      (item) => ['Order_Retrocharge','Refund_Retrocharge'].includes(String(item.type).trim())
    );

    //  Order_Retrocharge type 处理完成
    that.typeList["Order_Retrocharge"] = true;
    //  Refund_Retrocharge type 处理完成
    that.typeList["Refund_Retrocharge"] = true;

    

  }

  /**
   * 
   * 含义：亚马逊对您账户的调整。
   * 详细解释：这是一个涵盖范围很广的调整项，通常是手动操作或纠错的结果。可能包括：
   * 赔偿：亚马逊因丢失或损坏您的FBA库存而向您支付的赔偿。
   * 金额纠错：对之前交易中多扣或少扣费用的修正。
   * 其他杂项调整。
   * 注意：调整可以是正数（增加您的余额，如赔偿）或负数（减少您的余额，如纠正多付的款项）。
   */
  initAdjustmentType(sku:string){
    let that = this;

    let adjustmentTypeList = that.orderData.filter(
      (item) => item.sku === sku && item.type.toLocaleLowerCase().trim() === "adjustment"
    );

    //  退款金额
    let adjustmentAmount = adjustmentTypeList.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    that.report[sku]["Adjustment"] = adjustmentAmount.toFixed(2);

    //  Refund_Retrocharge type 处理完成
    that.typeList["Adjustment"] = true;
  }

  /**
   * Liquidations
   * 含义：清算收入。
   * 详细解释：当您通过亚马逊的“批量清货计划”处理冗余或积压的库存时，清货商支付给您的款项。
   * 这笔收入通常远低于商品原价。这是处理呆滞库存、回收部分成本的一种方式。
   * 
   * Liquidations Adjustments
   * 含义：清算调整。
   * 详细解释：对之前 Liquidations 交易的调整。
   * 例如，清算完成后，可能发现库存数量有误，或最终结算价格需要修正，就会通过此项进行多退少补。同样，可以是正数或负数。
   */
  initLiquidationsAndLiquidationsAdjustments(sku:string){
    let that = this;
    let list = that.orderData.filter(
      (item) => item.sku === sku && ['Liquidations','Liquidations Adjustments'].includes(String(item.type).trim())
    );

    let amount = list.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    that.report[sku]["Liquidations"] = amount.toFixed(2);

    that.typeList["Liquidations"] = true;
    that.typeList["Liquidations Adjustments"] = true;
  }


  /**
   * Vine计划  Vine Enrollment Fee
   */
  initAmazonFees(){
    let that = this;
    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "Amazon Fees"
    );
    that.AmazonFees = list
  }

  /**
   * 仓储费和长期仓储费
   */
  initFBAInventoryFee(){
    let that = this;
    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "FBA Inventory Fee"
    );
    that.FBAInventoryFee = list
  }


  /**
   * 入库配置费、广告费、优惠券、其他
   */
  initServiceFee(){
    let that = this;
    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "Service Fee"
    );

    //  广告费用  
    let res1 = list.filter(item => item.description.startsWith('Cost of Advertising'))
    //  优惠券 包含 settlement id、order id
    let res2 = list.filter(item => item.description.startsWith('Coupon Redemption Fee'))
    //  入库配置费
    let res3 = list.filter(item => item.description.startsWith('FBA Inbound Placement Service Fee'))
    //  计划外服务费-删除/丢弃的货物
    let res4 = list.filter(item => item.description.startsWith('Unplanned Service Charge'))
    //  订阅费
    let res5 = list.filter(item => item.description.startsWith('Subscription'))
    
    let others = list.filter(item => {
      let case1 = !item.description.startsWith('Cost of Advertising')
      let case2 = !item.description.startsWith('Coupon Redemption Fee')
      let case3 = !item.description.startsWith('FBA Inbound Placement Service Fee')
      let case4 = !item.description.startsWith('Unplanned Service Charge')
      let case5 = !item.description.startsWith('Subscription')
      return case1 && case2 && case3 && case4 && case5
    })


    console.log(`res1:${res1.length}`)
    console.log(`res2:${res2.length}`)
    console.log(`res3:${res3.length}`)
    console.log(`res4:${res4.length}`)
    console.log(`res5:${res5.length}`)
    console.log(`others:${others.length}`)

    

    


  }

}

export { ReportCalc };
