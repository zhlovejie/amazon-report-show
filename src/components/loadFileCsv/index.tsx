import { useRef, useState } from "react";
import Papa from "papaparse";
import numbro from "numbro";
import { CURRENCY_FORMATTER_OBJECT } from "@/types/common";
// import { loadOrderByMock, loadStorageByMock } from "@/mockdata/test";
import { Button, message, Spin, Tag } from "antd";
import { SettingOutlined } from "@ant-design/icons";
// import { CloseOutlined } from "@ant-design/icons";
import { getAdsFromCache } from "@/utils/common";
import type {
  CallbackParams,
  RawOrderRow,
  RawStorageRow,
  ReportFileType,
  ResultAdvertisingBillData,
  ProductConfig,
} from "@/types/common";
import { cn } from "@/utils/classnames";
import {
  findUnrecognizedProducts,
  type UnrecognizedProductReference,
} from "@/config/products";
type LoadFileCsvProps = {
  callback: (params: CallbackParams) => void;
  productList: ProductConfig[];
  unrecognizedProductCount: number;
  onManageProducts: () => void;
  onUnrecognizedProducts: (products: UnrecognizedProductReference[]) => void;
};

type CsvReportFileType = Exclude<ReportFileType, "ads">;
type ParsedCsvRow<T extends CsvReportFileType> = T extends "order"
  ? RawOrderRow
  : RawStorageRow;

/**
 * 上传文件，返回解析csv数据
 * @param param0
 * @returns
 */
function LoadFileCsv({
  callback,
  productList,
  unrecognizedProductCount,
  onManageProducts,
  onUnrecognizedProducts,
}: LoadFileCsvProps) {
  // const IS_TEST_MODEL = true;
  const [showPanel, setShowPanel] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinningDescription, setSpinningDescription] = useState("处理中...");

  const [selectedOrderFile, setSelectedOrderFile] = useState<File | null>(null);
  const [selectedStorageFile, setSelectedStorageFile] = useState<File | null>(
    null,
  );
  const [selectedAdsFile, setSelectedAdsFile] = useState<File | null>(null);
  const fileInputOrderRef = useRef<HTMLInputElement>(null);
  const fileInputStorageRef = useRef<HTMLInputElement>(null);
  const fileInputAdsRef = useRef<HTMLInputElement>(null);

  const [fileInputOrderName, setFileInputOrderName] = useState<string | null>(
    null,
  );
  const [fileInputStorageName, setFileInputStorageName] = useState<
    string | null
  >(null);
  const [fileInputAdsName, setFileInputAdsName] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const elementName = event.target.name;
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      switch (elementName) {
        case "orderfile":
          setSelectedOrderFile(file);
          setFileInputOrderName(file.name);
          break;
        case "storagefile":
          setSelectedStorageFile(file);
          setFileInputStorageName(file.name);
          break;
        case "adsfile":
          setSelectedAdsFile(file);
          setFileInputAdsName(file.name);
          break;
        default:
          break;
      }
    }

    setTimeout(function () {
      event.target.value = "";
    }, 200);
  }
  function handleFileRemove(type: ReportFileType) {
    if (type === "order") {
      setSelectedOrderFile(null);
      setFileInputOrderName(null);
      return;
    }
    if (type === "storage") {
      setSelectedStorageFile(null);
      setFileInputStorageName(null);
      return;
    }
    if (type === "ads") {
      setSelectedAdsFile(null);
      setFileInputAdsName(null);
      return;
    }
  }

  // 封装成一个通用的解析函数
  function parseCsvWithDynamicHeader<T extends CsvReportFileType>(
    file: File | string,
    type: T,
  ): Promise<Array<ParsedCsvRow<T>>> {
    return new Promise((resolve, reject) => {
      // 1. 第一步：探测表头位置 (使用 preview 模式只读前 20 行)
      Papa.parse(file, {
        preview: 20,
        complete: (results) => {
          // for order check :
          const type_order_header_check_list = [
            "date/time",
            "settlement id",
            "type",
            "order id",
            "sku",
          ];

          const type_storage_header_check_list = [
            "asin",
            "fnsku",
            "product_name",
          ];

          const header_check_list =
            type === "order"
              ? type_order_header_check_list
              : type_storage_header_check_list;

          const rows = results.data;
          // 关键点：寻找包含 "date/time" 的那一行索引
          const headerIndex = rows.findIndex((row) => {
            const cells = Array.isArray(row) ? row.map(String) : [];
            return header_check_list.every((cell) =>
              cells.includes(String(cell).trim().toLowerCase()),
            );
          });
          if (headerIndex === -1) {
            reject(
              new Error(
                `${type === "order" ? "【销售报表】" : "【仓储报表】"}格式错误，请检查`,
              ),
            );
            return;
          }

          // 如果没找到，默认从第 0 行开始
          const skipRows = headerIndex === -1 ? 0 : headerIndex;

          // 2. 第二步：执行正式解析
          Papa.parse(file, {
            skipEmptyLines: true,
            header: true,
            // 动态跳过说明文字
            beforeFirstChunk: (chunk) => {
              if (skipRows === 0) return chunk;
              const lines = chunk.split(/\r\n|\r|\n/);
              lines.splice(0, skipRows);
              return lines.join("\n");
            },
            transform: function (value, column) {
              // --- 保持你原有的货币转换逻辑 ---
              const column_list = CURRENCY_FORMATTER_OBJECT[type];
              if (Array.isArray(column_list) && column_list.length > 0) {
                const column_str = String(column).trim();
                if ((column_list as readonly string[]).includes(column_str)) {
                  return String(numbro.unformat(value));
                }
              }
              return value;
            },
            complete: ({ data }) => {
              console.log(`成功定位表头（第 ${skipRows + 1} 行），解析完成。`);
              resolve(data as Array<ParsedCsvRow<T>>);
            },
            error: (err) => reject(err),
          });
        },
      });
    });
  }

  async function initFilesData() {
    // if (IS_TEST_MODEL) {
    //   const orderData = await parseFile(await loadOrderByMock(),'order');
    //   const storageData = await parseFile(await loadStorageByMock(),'storage');
    //   // console.log(orderData);
    //   // console.log(storageData);

    //   callback({
    //     status: "ok",
    //     orderData,
    //     storageData,
    //   });

    //   return;
    // }

    if (!selectedOrderFile) {
      message.warning("请上传销售报表");
      return;
    }
    if (!selectedStorageFile) {
      message.warning("请上传仓储报表");
      return;
    }

    // if (!selectedAdsFile){
    //   alert("请上传广告pdf");
    //   return
    // }
    try {
      const orderData = await parseCsvWithDynamicHeader(
        selectedOrderFile,
        "order",
      );
      const storageData = await parseCsvWithDynamicHeader(
        selectedStorageFile,
        "storage",
      );
      const unrecognizedProducts = findUnrecognizedProducts(
        orderData,
        storageData,
        productList,
      );
      if (unrecognizedProducts.length > 0) {
        onUnrecognizedProducts(unrecognizedProducts);
        message.warning(
          `发现 ${unrecognizedProducts.length} 项未配置产品标识，请先完成产品配置`,
        );
        return;
      }

      onUnrecognizedProducts([]);
      if (selectedAdsFile) {
        setSpinning(true);
        setSpinningDescription("广告报表处理中...");
      }
      const adsData: ResultAdvertisingBillData | Record<string, never> =
        selectedAdsFile ? await getAdsFromCache(selectedAdsFile) : {};
      // console.log(orderData);
      // console.log(storageData);

      callback({
        status: "ok",
        orderData,
        storageData,
        adsData: "data" in adsData ? adsData.data ?? undefined : undefined,
      });

      setShowPanel(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);

        callback({
          status: "error",
          message: error.message,
        });
      }
    } finally {
      setSpinning(false);
      setSpinningDescription("");
    }
  }

  return (
    <>
      <Spin spinning={spinning} description={spinningDescription} fullscreen />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="dashed"
          variant="solid"
          shape="round"
          size="medium"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? "隐藏导入区" : "显示导入区"}
        </Button>
        <Button
          danger={unrecognizedProductCount > 0}
          type={unrecognizedProductCount > 0 ? "primary" : "default"}
          shape="round"
          size="medium"
          icon={<SettingOutlined />}
          onClick={onManageProducts}
        >
          {unrecognizedProductCount > 0
            ? `待配置产品 (${unrecognizedProductCount})`
            : `产品配置 (${productList.length})`}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          showPanel ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5 bg-red-50 rounded-md mt-2">
            <div className=" grid grid-cols-3 gap-5 mb-5">
              <div className="flex justify-start items-start relative bg-white rounded-md shadow-md">
                {!fileInputOrderName && (
                  <div className="w-[300px] h-[100px] ">
                    <input
                      className=" opacity-0 absolute top-0 left-0 right-0 bottom-0 cursor-pointer"
                      ref={fileInputOrderRef}
                      accept=".csv"
                      type="file"
                      name="orderfile"
                      id="orderfile"
                      onChange={handleFileChange}
                    />
                    <div className=" text-[18px] absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                      上传销售报表
                    </div>
                  </div>
                )}
                {fileInputOrderName && (
                  <div className="w-full h-[100px] flex flex-col pointer-events-non">
                    <div className="flex justify-between items-center py-1 px-2 shadow">
                      <Tag variant="outlined" color="red">
                        销售报表
                      </Tag>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleFileRemove("order")}
                      >
                        清除
                      </Button>
                    </div>
                    <div className=" break-all flex-1 p-2 overflow-auto">
                      {fileInputOrderName}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-start items-start relative bg-white rounded-md shadow-md">
                {!fileInputStorageName && (
                  <div className="w-[300px] h-[100px]">
                    <input
                      className=" opacity-0 absolute top-0 left-0 right-0 bottom-0 cursor-pointer"
                      ref={fileInputStorageRef}
                      accept=".csv"
                      type="file"
                      name="storagefile"
                      id="storagefile"
                      onChange={handleFileChange}
                    />
                    <div className=" text-[18px] absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                      上传仓储报表
                    </div>
                  </div>
                )}
                {fileInputStorageName && (
                  <div className="w-full h-[100px] flex flex-col pointer-events-non">
                    <div className="flex justify-between items-center py-1 px-2 shadow">
                      <Tag variant="outlined" color="red">
                        仓储报表
                      </Tag>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleFileRemove("storage")}
                      >
                        清除
                      </Button>
                    </div>
                    <div className=" break-all flex-1 p-2 overflow-auto">
                      {fileInputStorageName}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-start items-start relative bg-white rounded-md shadow-md">
                {!fileInputAdsName && (
                  <div className="w-[300px] h-[100px]">
                    <input
                      className=" opacity-0 absolute top-0 left-0 right-0 bottom-0 cursor-pointer"
                      ref={fileInputAdsRef}
                      accept=".pdf"
                      type="file"
                      name="adsfile"
                      id="adsfile"
                      onChange={handleFileChange}
                    />
                    <div className=" text-[18px] absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                      上传广告报表
                    </div>
                  </div>
                )}
                {fileInputAdsName && (
                  <div className="w-full h-[100px] flex flex-col pointer-events-non">
                    <div className="flex justify-between items-center py-1 px-2 shadow">
                      <Tag variant="outlined" color="red">
                        广告报表
                      </Tag>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleFileRemove("ads")}
                      >
                        清除
                      </Button>
                    </div>
                    <div className=" break-all flex-1 p-2 overflow-auto">
                      {fileInputAdsName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className=" flex items-center justify-between">
              <div className=" w-1/2 m-auto">
                <Button
                  type="dashed"
                  block
                  shape="round"
                  size="large"
                  onClick={initFilesData}
                >
                  开始统计
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadFileCsv;
