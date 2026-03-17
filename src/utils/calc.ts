import _ from "lodash";
import Decimal from "decimal.js";
import type {
  OrderHeaderKeyTypeObject,
  StorageHeaderKeyTypeObject,
  ReportObjectType,
  ReprotItem,
  ReportCalcConstructorParams,
  AdvertisingBillData,
} from "@/types/common";

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
  productList = [
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
    },
    {
      __no: 2,
      __name: "门后-孖黑",
      __fnsku: "X003TKCFCF",
      __asin: "B0C538JL1X",
      __sku: "hook02",
      __ads: [],
      __coupon: ["2 Pack Door Hanger", "2 pack door hanger"],
    },
    {
      __no: 3,
      __name: "门后-单白",
      __fnsku: "X0048XOI7H",
      __asin: "B0D4MCXCC6",
      __sku: "hook01-white",
      __ads: [],
      __coupon: ["White Over the Door Hanger", "over the door towel rack"],
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
    },
    {
      __no: 5,
      __name: "T18黑",
      __fnsku: "X004EJ051D",
      __asin: "B0DHQ8QGQG",
      __sku: "T-tie-black01",
      __ads: ["T18-手动精准-推Tie Hanger"],
      __coupon: ["tie organizer for men"],
    },
    {
      __no: 6,
      __name: "T18褐双",
      __fnsku: "X004Q4DZLX",
      __asin: "B0FDFSKK4L",
      __sku: "T-tie-red002",
      __ads: [],
      __coupon: [],
    },
    {
      __no: 7,
      __name: "双14墙挂黑",
      __fnsku: "X004DAC1AV",
      __asin: "B0DDXB7T2H",
      __sku: "tie-wall-02black",
      __ads: [
        "2Pack Wall Mounted Tie Rack Black",
        "墙挂14钩-手动-tie wall closet",
      ],
      __coupon: [],
    },
    {
      __no: 8,
      __name: "双14墙挂白",
      __fnsku: "X004DA8SY9",
      __asin: "B0DDX41KTY",
      __sku: "tie-wall-02white",
      __ads: ["2Pack Wall Mounted Tie Rack White"],
      __coupon: [],
    },
  ];

  orderData: Array<OrderHeaderKeyTypeObject> = [];
  // 备份
  __orderDataCache: Array<OrderHeaderKeyTypeObject> = [];
  storageData: Array<StorageHeaderKeyTypeObject> = [];

  skuList: Array<string> = [];

  //  记录报表类型处理进度
  typeList = {} as { [key: string]: boolean };

  report: ReportObjectType = {};

  // type Order_Retrocharge Refund_Retrocharge 先保存下来，待处理
  OrderRetrochargeTypeAndRefundRetrochargeType: Array<OrderHeaderKeyTypeObject> =
    [];

  // type Amazon Fees 先保存下来，待处理
  AmazonFees: Array<OrderHeaderKeyTypeObject> = [];
  // 仓储费 先保存下来，待处理
  FBAInventoryFee: Array<OrderHeaderKeyTypeObject> = [];

  constructor({ orderData, storageData }: ReportCalcConstructorParams) {
    this.orderData = orderData
      .map((o) => {
        o.__status = "pending";
        return o;
      })
      .filter((o) => o.type !== "Transfer");
    this.storageData = storageData.map((o) => {
      o.__status = "pending";
      return o;
    });

    this.__orderDataCache = JSON.parse(JSON.stringify(orderData));
  }

  init() {
    this.initSku();
    this.initCalc();
  }

  getReportList() {
    let that = this;
    let arr: Array<ReprotItem> = [];
    that.skuList.map((sku) => {
      let target = that.report[sku];
      arr.push({
        ...target,
        sku,
      } as ReprotItem);
    });
    return arr.sort((n1, n2) => {
      return n1.__no - n2.__no;
    });
  }

  getPendingList() {
    let that = this;
    return that.orderData
      .filter((o) => o.__status === "pending")
      .sort((n1, n2) =>
        n1.type > n2.type ? 1 : -1,
      ) as unknown as Array<ReprotItem>;
  }

  /**
   * 记录报表中的 sku，type 防止计算遗漏
   */
  initSku() {
    let that = this;

    // 报表中筛选的 sku
    const _skuList = that.orderData
      .filter((item) => item.type === "Order")
      .map((item) => {
        return item.sku;
      });
    // 预设的sku
    const _defaultSkuList = that.productList.map((p) => p.__sku);

    // 合并sku
    that.skuList = [...new Set([..._skuList, ..._defaultSkuList])].filter(
      (sku) => String(sku).length > 0,
    );

    const _typeList = that.orderData.map((item) => {
      return item.type;
    });

    //  几个type
    [...new Set(_typeList)].map((type) => {
      that.typeList[type] = false;
    });

    that.skuList.map((sku) => {
      let target = that.productList.find((p) => p.__sku === sku);
      if (target) {
        that.report[sku] = { ...target };
      } else {
        that.report[sku] = {};
      }
    });
  }

  initCalc() {
    let that = this;
    that.skuList.map((sku) => {
      that.initOrderType(sku);
      that.initRefundType(sku);
      that.initAdjustmentType(sku);
      that.initLiquidationsAndLiquidationsAdjustments(sku);
      // 添加额外的成本计算列
      that.initAdditionalAttributes(sku);
    });
    that.init_FBA_Transaction_fees();
    that.init_Order_Retrocharge();
    that.initStorage();
    that.initFBA_Inbound_Placement_Service_Fee();
    that.initServiceFee();
    that.initAmazonFees();
    that.init_FBA_Removal_Order_Disposal_Fee();
    that.initOthers();

    console.warn("待处理的数据.......");
    console.log(that.orderData.filter((o) => o.__status === "pending"));
    console.warn("待处理的数据.......");

    console.warn("待处理的type.......");
    console.log(
      Object.keys(that.typeList).filter((key) => !that.typeList[key]),
    );
    console.warn("待处理的type.......");
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
      (item) =>
        item.sku === sku && item.type.toLocaleLowerCase().trim() === "order",
    );

    //  销量
    let qty = orderTypeList.reduce((initVal, item) => {
      return initVal.add(Decimal(item.quantity));
    }, Decimal(0));

    const reportItem = that.report[sku] as ReprotItem;

    reportItem["qty"] = qty.toFixed(0);

    //  销售额
    let productSales = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["product sales"]);
    }, Decimal(0));

    reportItem["productSales"] = productSales.toFixed(2);

    //  佣金
    let sellingFees = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["selling fees"]);
    }, Decimal(0));

    reportItem["sellingFees"] = sellingFees.toFixed(2);

    //  FBA配送费
    let fbaFees = orderTypeList.reduce((initVal, item) => {
      return initVal.add(item["fba fees"]);
    }, Decimal(0));

    reportItem["fbaFees"] = fbaFees.toFixed(2);

    // 计算其他列
    const other_column = [
      "product sales tax",
      "shipping credits",
      "shipping credits tax",
      "gift wrap credits",
      "giftwrap credits tax",
      "Regulatory Fee",
      "Tax On Regulatory Fee",
      "promotional rebates",
      "promotional rebates tax",
      "marketplace withheld tax",
      "other transaction fees",
      "other",
    ];

    const other_value = other_column
      .map((col) => {
        let res = orderTypeList.reduce((initVal, item) => {
          return initVal.add(item[col as keyof OrderHeaderKeyTypeObject]);
        }, Decimal(0));
        return res;
      })
      .reduce((v1, v2) => {
        return v1.add(v2);
      }, Decimal(0));
    reportItem["others"] = other_value.toFixed(2);

    //  order type 处理完成
    that.typeList["Order"] = true;

    // 标记为处理完成
    orderTypeList.map((o) => {
      o.__status = "done";
      return o;
    });

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
      (item) =>
        item.sku === sku && item.type.toLocaleLowerCase().trim() === "refund",
    );

    //  退款金额
    let refundAmount = refundTypeList.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    const reportItem = that.report[sku] as ReprotItem;

    reportItem["refund"] = refundAmount.toFixed(2);

    //  退款数量
    let refundQty = refundTypeList.reduce((initVal, item) => {
      return initVal.add(item.quantity);
    }, Decimal(0));

    reportItem["refundQty"] = refundQty.toFixed(2);

    //  退货率= 退货数量 / 销售数量 * 100
    const sellsQty = Decimal(reportItem["qty"] as any);
    if (sellsQty.isZero()) {
      // 除数为零情况
      reportItem["refundRate"] = Decimal(0).toFixed(2);
    } else {
      reportItem["refundRate"] = refundQty.div(sellsQty).mul(100).toFixed(2);
    }

    //  Refund type 处理完成
    that.typeList["Refund"] = true;

    refundTypeList.map((o) => {
      o.__status = "done";
      return o;
    });
    // console.warn(`order type sku:${sku} ${refundTypeList.length}条记录`)
  }

  /**
   * 对应列名：清算
   * 含义：亚马逊对您账户的调整。
   * 详细解释：这是一个涵盖范围很广的调整项，通常是手动操作或纠错的结果。可能包括：
   * 赔偿：亚马逊因丢失或损坏您的FBA库存而向您支付的赔偿。
   * 金额纠错：对之前交易中多扣或少扣费用的修正。
   * 其他杂项调整。
   * 注意：调整可以是正数（增加您的余额，如赔偿）或负数（减少您的余额，如纠正多付的款项）。
   */
  initAdjustmentType(sku: string) {
    let that = this;

    let adjustmentTypeList = that.orderData.filter(
      (item) =>
        item.sku === sku &&
        item.type.toLocaleLowerCase().trim() === "adjustment",
    );

    const reportItem = that.report[sku] as ReprotItem;

    //  退款金额
    let adjustmentAmount = adjustmentTypeList.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    reportItem["Adjustment"] = adjustmentAmount.toFixed(2);

    //  Refund_Retrocharge type 处理完成
    that.typeList["Adjustment"] = true;

    adjustmentTypeList.map((o) => {
      o.__status = "done";
      return o;
    });
  }

  /**
   * 对应列明 清货
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
  initLiquidationsAndLiquidationsAdjustments(sku: string) {
    let that = this;
    // if(sku === 'hook01'){
    //   debugger
    // }
    const reportItem = that.report[sku] as ReprotItem;

    let target = that.productList.find((item) => item.__sku === sku);

    if (!target) {
      throw new Error(`${sku}异常`);
    }

    let combineSku = [target.__sku, target.__fnsku, target.__asin];

    let list = that.orderData.filter(
      (item) =>
        combineSku.includes(item.sku) &&
        ["Liquidations", "Liquidations Adjustments"].includes(item.type.trim()),
    );

    let amount = list.reduce((initVal, item) => {
      return initVal.add(item.total);
    }, Decimal(0));

    reportItem["Liquidations"] = amount.toFixed(2);

    that.typeList["Liquidations"] = true;
    that.typeList["Liquidations Adjustments"] = true;

    list.map((o) => {
      o.__status = "done";
      return o;
    });
  }

  /**
   * 列名：FBA移除订单：弃置费  ,,, （无SKU，有订单号）需要单列出来
   * 计算 description 为 FBA Removal Order: Disposal Fee
   */
  init_FBA_Removal_Order_Disposal_Fee() {
    const that = this;
    // that.orderData.filter(
    //   (item) =>
    //     String(item.description).trim() === "FBA Removal Order: Disposal Fee",
    // );

    that.productList.map((p) => {
      let reportSku = that.report[p.__sku] as any;
      reportSku["Disposal_Fee"] = Decimal(0).toFixed(2);
    });
  }

  /**
   * 列名：FBA 交易费用
   * 计算 type 为 FBA Transaction fees 类型，description 里面 包含 ASIN ，从而知道属于哪个品
   */
  init_FBA_Transaction_fees() {
    const that = this;
    let combineSkuList = that.productList.map((target) => {
      return [target.__sku, target.__fnsku, target.__asin];
    });

    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "FBA Transaction fees",
    );

    let listTarget = list.map((item) => {
      return {
        description: item.description,
        total: item.total,
      };
    });

    let res: { [key: string]: string[] } = {};

    // 先初始化所有可能的 key
    combineSkuList.forEach((arr) => {
      if (!res[arr[0]]) {
        res[arr[0]] = [];
      }
    });

    listTarget.map((item) => {
      combineSkuList.map((arr) => {
        if (arr.some((str) => item.description.includes(str))) {
          res[arr[0]].push(item.total);
        }
      });
    });

    Object.keys(res).forEach((key) => {
      let total = res[key]
        .reduce((v1, v2) => {
          return v1.add(v2);
        }, Decimal(0))
        .toFixed(2);

      that.report[key]["FBA_Transaction_fees"] = total;
    });

    list.map((o) => {
      o.__status = "done";
      return o;
    });
  }

  /**
   * 列名：订单退款撤销
   * 计算 type 为 Order_Retrocharge 类型，description 里面 包含 ASIN ，从而知道属于哪个品
   */
  init_Order_Retrocharge() {
    let that = this;
    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "Order_Retrocharge",
    );

    let listTarget = list.map((item) => {
      return {
        description: item.description,
        sku: item.sku,
        total: item.total,
        orderId: item["order id"],
      };
    });

    let res: { [key: string]: string[] } = {};

    let combineSkuList = that.productList.map((target) => {
      return [target.__sku, target.__fnsku, target.__asin];
    });

    // 先初始化所有可能的 key
    combineSkuList.forEach((arr) => {
      if (!res[arr[0]]) {
        res[arr[0]] = [];
      }
    });

    listTarget.map((item) => {
      combineSkuList.map((arr) => {
        if (arr.includes(item.sku)) {
          res[arr[0]].push(item.total);
        }
      });
    });

    Object.keys(res).forEach((key) => {
      let total = res[key]
        .reduce((v1, v2) => {
          return v1.add(v2);
        }, Decimal(0))
        .toFixed(2);

      that.report[key]["Order_Retrocharge"] = total;
    });

    list.map((o) => {
      o.__status = "done";
      return o;
    });

    that.typeList["Order_Retrocharge"] = true;
  }

  /**
   * Service Fee 广告费、优惠券、秒杀、订阅费
   */
  initServiceFee() {
    let that = this;
    let list = that.orderData.filter(
      (item) => String(item.type).trim() === "Service Fee",
    );

    //  广告费用 忽略掉
    let advertisingList = list.filter((item) =>
      item.description.startsWith("Cost of Advertising"),
    );

    advertisingList.map((o) => {
      o.__status = "done";
      return o;
    });

    //  订阅费
    let subscriptionList = list.filter((item) =>
      item.description.startsWith("Subscription"),
    );
    subscriptionList.map((o) => {
      if (Decimal(o.total).isZero()) {
        o.__status = "done";
      }
      return o;
    });

    // 优惠券折扣，25年6月之前的报表存在这个，，慢慢会被淘汰
    let couponRedemptionFeeList = list.filter((item) =>
      item.description.startsWith("Coupon Redemption Fee"),
    );
    that.productList.map((p) => {
      const reportSku = that.report[p.__sku] as any;
      const total = couponRedemptionFeeList
        .filter((item) =>
          p.__coupon.some((c) => {
            let s1 = String(c).trim().toLocaleLowerCase();
            let s2 = String(item.description).trim().toLocaleLowerCase();
            return s1.includes(s2) || s2.includes(s1);
          }),
        )
        .reduce((acc, cur) => acc.add(cur.total), Decimal(0))
        .toFixed(2);

      reportSku["Coupon_Redemption_Fee"] = total;
    });

    couponRedemptionFeeList.map((o) => {
      o.__status = "done";
      return o;
    });

    let others = list.filter((item) => {
      let case1 = item.description.startsWith("Cost of Advertising");
      let case2 = item.description.startsWith("Subscription");
      let case3 = item.description.startsWith("Coupon Redemption Fee");
      return !case1 && !case2 && !case3;
    });

    others.map((o) => {
      if (Decimal(o.total).isZero()) {
        o.__status = "done";
      }
    });

    that.typeList["Service Fee"] = true;
  }

  /**
   * 主要处理 优惠券基础费和优惠券费用
   */
  initAmazonFees() {
    const that = this;

    const listBase = that.orderData.filter(
      (o) =>
        o.type === "Amazon Fees" &&
        o.description.startsWith("Coupon Performance Based Fee"),
    );

    const list = that.orderData.filter(
      (o) =>
        o.type === "Amazon Fees" &&
        o.description.startsWith("Coupon Participation Fee"),
    );

    const listVine = that.orderData.filter(
      (o) =>
        o.type === "Amazon Fees" &&
        o.description.startsWith("Vine Enrollment Fee"),
    );

    const listDeal = that.orderData.filter(
      (o) => o.type === "Amazon Fees" && o.description.startsWith("Deal"),
    );

    that.productList.map((p) => {
      let reportSku = that.report[p.__sku] as any;
      let combineSku = [p.__sku, p.__fnsku, p.__asin];

      // 优惠券基础费
      let couponBaseFee = listBase
        .filter((o) => combineSku.includes(o.sku))
        .reduce((acc, cur) => acc.add(cur.total), Decimal(0));
      reportSku["Coupon_Performance_Based_Fee"] = couponBaseFee.toFixed(2);

      listBase
        .filter((o) => combineSku.includes(o.sku))
        .map((o) => {
          o.__status = "done";
          return o;
        });

      // 优惠券
      let couponFee = list
        .filter((o) => combineSku.includes(o.sku))
        .reduce((acc, cur) => acc.add(cur.total), Decimal(0));
      reportSku["Coupon_Participation_Fee"] = couponFee.toFixed(2);

      list
        .filter((o) => combineSku.includes(o.sku))
        .map((o) => {
          o.__status = "done";
          return o;
        });

      // vine
      let vineFee = listVine
        .filter((o) => combineSku.includes(o.sku))
        .reduce((acc, cur) => acc.add(cur.total), Decimal(0));
      reportSku["Vine_Enrollment_Fee"] = vineFee.toFixed(2);

      listVine
        .filter((o) => combineSku.includes(o.sku))
        .map((o) => {
          o.__status = "done";
          return o;
        });

      // Deal
      let dealFee = listDeal
        .filter((o) => combineSku.includes(o.sku))
        .reduce((acc, cur) => acc.add(cur.total), Decimal(0));
      reportSku["Deal"] = dealFee.toFixed(2);

      listDeal
        .filter((o) => combineSku.includes(o.sku))
        .map((o) => {
          o.__status = "done";
          return o;
        });

      // 基础广告费
      reportSku["Cost_of_Advertising"] = Decimal(0).toFixed(2);
    });
  }

  /**
   * 其余一切未处理的，total不为0的都显示出来
   */
  initOthers() {
    const that = this;
    const list = that.orderData.filter((o) => o.__status === "pending");
    list.map((o) => {
      if (Decimal(o.total).isZero()) {
        o.__status = "done";
      }
      return o;
    });
  }
  /**
   * 处理入库配置费
   */
  initFBA_Inbound_Placement_Service_Fee() {
    const that = this;
    const list = that.orderData.filter(
      (o) =>
        o.type === "Service Fee" &&
        o.description === "FBA Inbound Placement Service Fee",
    );

    that.productList.map((p) => {
      let reportSku = that.report[p.__sku] as any;
      reportSku["FBA_Inbound_Placement_Service_Fee"] = Decimal(0).toFixed(2);
    });

    list.map((o) => {
      if (Decimal(o.total).isZero()) {
        o.__status = "done";
      }
    });
  }

  /**
   * 计算仓储费用
   * @param {*} dataList 解析后的数组对象
   * @returns
   */
  initStorage() {
    const that = this;

    for (let item of that.productList) {
      let targetFnsku = item.__fnsku;
      let targetData = that.storageData.filter(
        (line) => line["fnsku"] === targetFnsku,
      );
      let totalStorageFee = Decimal(0);
      for (let line of targetData) {
        totalStorageFee = totalStorageFee.minus(
          line["estimated_monthly_storage_fee"],
        );
      }

      that.report[item.__sku]["StorageFee"] = totalStorageFee.toFixed(4);
    }

    // 报表中的仓储费 设置状态
    let list = that.orderData.filter(
      (o) =>
        o.type === "FBA Inventory Fee" && o.description === "FBA storage fee",
    );
    if (list.length > 0) {
      list.map((o) => {
        o.__status = "done";
        return o;
      });
    }

    that.typeList["FBA Inventory Fee"] = true;
  }

  /**
   * 添加 回款、进价、重量、国内物流、海运报价、海运费、单个成本、成本(RMB)、成本($)、毛利润、毛利率
   * @param sku
   */
  initAdditionalAttributes(sku: string) {
    const that = this;
    let reportSku = that.report[sku] as any;
    // 回款
    reportSku["extra_payment_collection"] = Decimal(0).toFixed(2);
    // 进价
    reportSku["extra_purchase_price"] = Decimal(0).toFixed(2);
    // 重量
    reportSku["extra_weight"] = Decimal(0).toFixed(2);
    // 国内物流
    reportSku["extra_inside_express_price"] = Decimal(0).toFixed(2);
    // 海运报价
    reportSku["extra_shipping_price"] = Decimal(7).toFixed(2);
    // 海运费
    reportSku["extra_shipping_fee"] = Decimal(0).toFixed(2);
    // 单个成本
    reportSku["extra_single_cost_price"] = Decimal(0).toFixed(2);
    // 成本(RMB)
    reportSku["extra_rmb_cost"] = Decimal(0).toFixed(2);
    // 成本($)
    reportSku["extra_doller_cost"] = Decimal(0).toFixed(2);
    // 毛利润
    reportSku["extra_gross_profit"] = Decimal(0).toFixed(2);
    // 毛利率
    reportSku["extra_rate_of_gross_profit"] = Decimal(0).toFixed(2);
  }

  /**
   * 分析广告PDF 数据
   * @param adsData
   */
  initCalcAds(adsData: AdvertisingBillData) {
    // debugger
    const that = this;
    const { statement_summary_totals, single_country_campaign_details } =
      adsData;

    const { total_adjustments, total_regulatory_advertising_fees } =
      statement_summary_totals;

    let _toatal = Decimal(0);
    that.productList.map((p) => {
      const reportSku = that.report[p.__sku] as any;
      if (Array.isArray(p.__ads) && p.__ads.length > 0) {
        let details =
          single_country_campaign_details.campaign_details_table.filter(
            (item) => {
              return p.__ads.some((v) => {
                let s1 = String(v).trim().toLocaleLowerCase();
                let s2 = String(item.campaign_name).trim().toLocaleLowerCase();
                return s1.includes(s2) || s2.includes(s1);
              });
            },
          );
        if (details.length > 0) {
          reportSku["Cost_of_Advertising"] = details
            .reduce(
              (initVal, item) => initVal.minus(item.amount_ex_tax),
              Decimal(0),
            )
            .toFixed(2);
          _toatal = _toatal.add(reportSku["Cost_of_Advertising"]);
        }
      } else {
        reportSku["Cost_of_Advertising"] = Decimal(0).toFixed(2);
      }
    });

    if (!_toatal.equals(statement_summary_totals.total_campaign_charges)) {
      console.warn("广告计算不匹配");
      console.warn(`本地计算   _toatal:${_toatal}`);
      console.warn(
        `大模型计算 _toatal:${statement_summary_totals.total_campaign_charges}`,
      );
    }

    let isDone = false;
    that.productList.map((p) => {
      const reportSku = that.report[p.__sku] as any;
      const currentAdsCost = Decimal(reportSku["Cost_of_Advertising"] || 0);

      if (!currentAdsCost.equals(0) && !isDone) {
        // 合并计算费用并取负值
        const otherFee = Decimal(total_adjustments)
          .plus(total_regulatory_advertising_fees)
          .negated();

        reportSku["Cost_of_Advertising_other"] = otherFee.toFixed(2);
        isDone = true;
      } else {
        reportSku["Cost_of_Advertising_other"] = "0.00";
      }
    });

    // 3. 兜底逻辑：如果循环结束 isDone 仍为 false，说明没找到有广告费的产品
    if (!isDone && that.productList.length > 0) {
      // 这种情况下，你可能需要将费用挂载到第一个产品或某个特定位置，防止丢账
      // 合并计算费用并取负值
      const otherFee = Decimal(total_adjustments)
        .plus(total_regulatory_advertising_fees)
        .negated()
        .toFixed(2);

      console.warn(`未找到有广告费的产品，杂费未分配！  otherFee:${otherFee}`);
    }
  }
}

export { ReportCalc };
