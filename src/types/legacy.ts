import type { AdvertisingBillResponse } from "./advertising";
import type {
  CategoryProfitRow,
  ReportItem,
  ReportMap,
  ReportSourceData,
} from "./report";
import type { TrackedOrderRow, TrackedStorageRow } from "./report-source";
import type { FileImportResult, ReportCalculatorInput } from "./workflow";

/** @deprecated Use `TrackedOrderRow`. */
export type OrderHeaderKeyTypeObject = TrackedOrderRow;

/** @deprecated Use `TrackedStorageRow`. */
export type StorageHeaderKeyTypeObject = TrackedStorageRow;

/** @deprecated Use `ReportCalculatorInput`. */
export type ReportCalcConstructorParams = ReportCalculatorInput;

/** @deprecated Use `ReportMap`. */
export type ReportObjectType = ReportMap;

/** @deprecated Use `FileImportResult`. */
export type CallbackParams = FileImportResult;

/** @deprecated Use `AdvertisingBillResponse`. */
export type ResultAdvertisingBillData = AdvertisingBillResponse;

/** @deprecated Use `ReportItem`. */
export type ReprotItem = ReportItem;

/** @deprecated Use `FileImportResult`. */
export type CallbackPrams = FileImportResult;

/** @deprecated Use `TrackedOrderRow`. */
export type OrderHeaderKeyTypeObjectLegacy = TrackedOrderRow;

/** @deprecated Use `TrackedStorageRow`. */
export type StorageHeaderKeyTypeObjectLegacy = TrackedStorageRow;

/** @deprecated Use `CategoryProfitRow`. */
export type CategoryTableRow = CategoryProfitRow;

/** @deprecated Use `ReportSourceData`. */
export type IReportSourceData = ReportSourceData;
