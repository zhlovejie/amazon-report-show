import type { ReprotItem, CategoryTableRow } from "@/types/common";
import Decimal from "decimal.js";
// ============================================================
// 第一步：把所有计算函数提到组件外部，接收 rate 作为显式参数
// 这样彻底消除对组件 state 的闭包依赖
// ============================================================

const D = (val: string | number | undefined) => new Decimal(val || 0);

/**
 * 计算回款
 */
function calc_extra_payment_collection(item: ReprotItem): ReprotItem {
  return {
    ...item,
    extra_payment_collection: D(item.productSales as string)
      .add(D(item.sellingFees as string))
      .add(D(item.fbaFees as string))
      .add(D(item.others as string))
      .add(D(item.refund as string))
      .add(D(item.Adjustment as string))
      .add(D(item.Cost_of_Advertising as string))
      .add(D(item.Cost_of_Advertising_other as string))
      .add(D(item.Deal as string))
      .add(D(item.Vine_Enrollment_Fee as string))
      .add(D(item.Coupon_Performance_Based_Fee as string))
      .add(D(item.Coupon_Participation_Fee as string))
      .add(D(item.Coupon_Redemption_Fee as string))
      .add(D(item.StorageFee as string))
      .add(D(item.Disposal_Fee as string))
      .add(D(item.FBA_Transaction_fees as string))
      .add(D(item.Liquidations as string))
      .add(D(item.Order_Retrocharge as string))
      .add(D(item.FBA_Inbound_Placement_Service_Fee as string))
      .add(D(item.unallocated_value_other as string))
      .toFixed(2),
  };
}

/**
 * 计算海运费
 */
function calc_extra_shipping_fee(item: ReprotItem): ReprotItem {
  return {
    ...item,
    extra_shipping_fee: D(item.extra_weight as string)
      .div(1000)
      .mul(D(item.extra_shipping_price as string))
      .toFixed(2),
  };
}

/**
 * 计算单个成本RMB
 */
function calc_extra_single_cost_price(item: ReprotItem): ReprotItem {
  return {
    ...item,
    extra_single_cost_price: D(item.extra_purchase_price as string)
      .add(D(item.extra_inside_express_price as string))
      .add(D(item.extra_shipping_fee as string))
      .toFixed(2),
  };
}

/**
 * 计算单个成本美元 关键：rate 作为显式参数，不再从闭包捕获
 */
function calc_extra_single_doller_cost_price(
  item: ReprotItem,
  rate: string | number,
): ReprotItem {
  return {
    ...item,
    extra_single_doller_cost_price: D(item.extra_single_cost_price as string)
      .div(D(rate))
      .toFixed(2),
  };
}

/**
 * 计算总成本RMB
 */
function calc_extra_rmb_cost(item: ReprotItem): ReprotItem {
  return {
    ...item,
    extra_rmb_cost: D(item.extra_single_cost_price as string)
      .mul(D(item.qty as number))
      .toFixed(2),
  };
}

/**
 * 计算总成本美元 关键：rate 作为显式参数
 */
function calc_extra_doller_cost(
  item: ReprotItem,
  rate: string | number,
): ReprotItem {
  return {
    ...item,
    extra_doller_cost: D(item.extra_rmb_cost as string)
      .div(D(rate))
      .toFixed(2),
  };
}

/**
 * 计算毛利
 */
function calc_extra_gross_profit(item: ReprotItem): ReprotItem {
  return {
    ...item,
    extra_gross_profit: D(item.extra_payment_collection as string)
      .minus(D(item.extra_doller_cost as string))
      .toFixed(2),
  };
}

/**
 * 计算毛利、毛利率
 */
function calc_extra_rate_gross_profit(item: ReprotItem): ReprotItem {
  if (D(item.productSales).eq(0)) {
    return {
      ...item,
      extra_rate_of_gross_profit: D(0).toFixed(2),
    };
  } else {
    return {
      ...item,
      extra_rate_of_gross_profit: D(item.extra_gross_profit as string)
        .div(D(item.productSales))
        .mul(100)
        .toFixed(2),
    };
  }
}

/**
 * 计算广告占比
 */
function calc_AdvertisingRate(item: ReprotItem): ReprotItem {
  if (D(item.productSales).eq(0)) {
    return {
      ...item,
      AdvertisingRate: D(0).toFixed(2),
    };
  } else {
    const AdvertisingRate = D(item.Cost_of_Advertising as string)
      .abs()
      .add(D(item.Cost_of_Advertising_other as string).abs())
      .add(D(item.Deal as string).abs())
      .add(D(item.Vine_Enrollment_Fee as string).abs())
      .add(D(item.Coupon_Performance_Based_Fee as string).abs())
      .add(D(item.Coupon_Participation_Fee as string).abs())
      .add(D(item.Coupon_Redemption_Fee as string).abs());

    return {
      ...item,
      AdvertisingRate: AdvertisingRate.div(D(item.productSales))
        .mul(100)
        .toFixed(2),
    };
  }
}

// ============================================================
// 工具函数：对单条 item 跑完整计算链，rate 显式传入
// ============================================================
function runCalcPipeline(item: ReprotItem, rate: string | number): ReprotItem {
  return [
    calc_extra_payment_collection,
    calc_AdvertisingRate,
    calc_extra_shipping_fee,
    calc_extra_single_cost_price,
    (i: ReprotItem) => calc_extra_single_doller_cost_price(i, rate), // ✅ 注入 rate
    calc_extra_rmb_cost,
    (i: ReprotItem) => calc_extra_doller_cost(i, rate), // ✅ 注入 rate
    calc_extra_gross_profit,
    calc_extra_rate_gross_profit,
  ].reduce((acc, fn) => fn(acc), { ...item });
}

// ============================================================
// 工具函数：计算汇总统计，接收数据快照和汇率，纯函数无副作用
// ============================================================
interface CalcTotalResult {
  totalProductSales: string;
  totalExtraPaymentCollection: string;
  avgRateGrossProfit: string;
  totalSku: number;
  categoryData: Array<CategoryTableRow>;
}

function calcTotalFromSnapshot(
  snapshot: ReprotItem[],
  rate: string | number,
): CalcTotalResult {
  let n1 = D(0),
    n2 = D(0),
    n3 = D(0);

  snapshot.forEach((item) => {
    n1 = n1.add(D(item.productSales as string));
    n2 = n2.add(D(item.extra_payment_collection as string));
    n3 = n3.add(D(item.extra_rate_of_gross_profit as string));
  });

  // ✅ 修复：除以 0 守卫
  const n4 = snapshot.length > 0 ? n3.div(snapshot.length) : D(0);

  // 分类统计
  const categoryList = [
    ...new Set(snapshot.map((item) => item.__category as string)),
  ];
  const categoryData: Array<CategoryTableRow> = categoryList.map((category) => {
    const gross_profit_doller = snapshot
      .filter((item) => item.__category === category)
      .reduce((arr, cur) => arr.add(cur.extra_gross_profit as string), D(0))
      .toFixed(2);

    // ✅ 修复：用传入的 rate，不再从闭包取旧值
    const gross_profit_rmb = D(gross_profit_doller).mul(D(rate)).toFixed(2);

    return { name: category, gross_profit_doller, gross_profit_rmb };
  });

  return {
    totalProductSales: n1.toFixed(2),
    totalExtraPaymentCollection: n2.toFixed(2),
    avgRateGrossProfit: n4.toFixed(2),
    totalSku: snapshot.length,
    categoryData,
  };
}

export { runCalcPipeline, calcTotalFromSnapshot };
