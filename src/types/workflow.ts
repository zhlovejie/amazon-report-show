import type { AdvertisingBillData } from "./advertising";
import type { ProductConfig } from "./product";
import type { RawOrderRow, RawStorageRow } from "./report-source";

export interface ReportCalculatorInput {
  orderData: RawOrderRow[];
  storageData: RawStorageRow[];
  productList: ProductConfig[];
}

export type FileImportResult =
  | {
      status: "ok";
      orderData: RawOrderRow[];
      storageData: RawStorageRow[];
      adsData?: AdvertisingBillData;
      message?: string;
    }
  | {
      status: "error";
      message: string;
    };
