export interface StatementSummaryTotals {
  total_campaign_charges: number;
  total_adjustments: number;
  total_regulatory_advertising_fees: number;
  sub_total: number;
  total_amount_due: number;
}

export interface CampaignDetail {
  campaign_name: string;
  campaign_type: string;
  campaign_id: string;
  amount_ex_tax: number;
  invoice_id: string;
}

export interface SingleCountryCampaignDetails {
  country_name: string;
  total_campaign_charges: number;
  campaign_details_table: CampaignDetail[];
  campaign_charge_details_total: number;
}

export interface AdvertisingBillData {
  statement_summary_totals: StatementSummaryTotals;
  single_country_campaign_details: SingleCountryCampaignDetails;
}

export interface AdvertisingBillResponse {
  success: boolean;
  data: AdvertisingBillData | null;
  message?: string;
  raw_text?: string;
}
