import type { ProductConfig } from "./product";
import type { TrackedOrderRow } from "./report-source";

export interface ReportItemCalculatedFields {
  qty?: string;
  productSales?: string;
  sellingFees?: string;
  fbaFees?: string;
  others?: string;
  refund?: string;
  refundQty?: string;
  refundRate?: string;
  Adjustment?: string;
  Cost_of_Advertising?: string;
  Cost_of_Advertising_other?: string;
  Deal?: string;
  Vine_Enrollment_Fee?: string;
  Coupon_Performance_Based_Fee?: string;
  Coupon_Participation_Fee?: string;
  Coupon_Redemption_Fee?: string;
  AdvertisingRate?: string;
  StorageFee?: string;
  Disposal_Fee?: string;
  FBA_Transaction_fees?: string;
  Liquidations?: string;
  Order_Retrocharge?: string;
  FBA_Inbound_Placement_Service_Fee?: string;
  unallocated_value_other?: string;
  extra_payment_collection?: string;
  extra_purchase_price?: string;
  extra_weight?: string;
  extra_inside_express_price?: string;
  extra_shipping_price?: string;
  extra_shipping_fee?: string;
  extra_single_cost_price?: string;
  extra_single_doller_cost_price?: string;
  extra_rmb_cost?: string;
  extra_doller_cost?: string;
  extra_gross_profit?: string;
  extra_rate_of_gross_profit?: string;
}

export interface PendingRepairFields {
  __target__?: keyof ReportItemCalculatedFields;
}

export type PendingOrderRow = TrackedOrderRow & PendingRepairFields;

export interface ReportItemMetadata {
  sku: string;
  __key: number | string;
  __editStatus?: "edit" | "save" | "cancel";
}

export type ReportItem = ProductConfig &
  ReportItemCalculatedFields &
  ReportItemMetadata;

export type ReportMap = Record<string, Partial<ReportItem>>;

export interface CategoryProfitRow {
  name: string;
  gross_profit_rmb: string;
  gross_profit_doller: string;
}

export interface ReportSourceData {
  payment: string;
  ads: string;
  storage: string;
}
