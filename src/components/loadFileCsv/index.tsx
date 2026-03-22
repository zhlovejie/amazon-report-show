import { useRef, useState } from "react";
import Papa from "papaparse";
import numbro from "numbro";
import { CURRENCY_FORMATTER_OBJECT } from "@/types/common";
// import { loadOrderByMock, loadStorageByMock } from "@/mockdata/test";
import { Button, message, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { getAdsFromCache } from "@/utils/common";
import type { CallbackPrams } from "@/types/common";
import { cn } from "@/utils/classnames";
type LoadFileCsvProps = {
  callback: (params: CallbackPrams) => void;
};

type ReportFileType = "order" | "storage" | "ads";

/**
 * 上传文件，返回解析csv数据
 * @param param0
 * @returns
 */
function LoadFileCsv({ callback }: LoadFileCsvProps) {
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

  function parseFile(
    file: File | string,
    type: ReportFileType,
  ): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        skipEmptyLines: true,
        header: true,
        transform: function (value, column) {
          // 处理货币类型数据 例如：-1,013.48  去除逗号
          let column_list = CURRENCY_FORMATTER_OBJECT[type] as string[];

          if (Array.isArray(column_list) && column_list.length > 0) {
            let column_str = String(column).trim();
            if (column_list.includes(column_str)) {
              return String(numbro.unformat(value));
            }
          }
          return value;
        },
        complete: function ({ data, errors, meta }) {
          console.log("解析完成.", data);
          console.log("解析元数据", meta);
          if (errors.length > 0) {
            reject(new Error(errors[0].message));
          } else {
            resolve(data as Array<any>);
          }
        },
        error: function (error) {
          console.error(error);
          reject(error);
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
      if (selectedAdsFile) {
        setSpinning(true);
        setSpinningDescription("广告报表处理中...");
      }
      const adsData = selectedAdsFile
        ? await getAdsFromCache(selectedAdsFile)
        : {};

      setSpinning(false);
      setSpinningDescription("");
      const orderData = await parseFile(selectedOrderFile, "order");
      const storageData = await parseFile(selectedStorageFile, "storage");
      // console.log(orderData);
      // console.log(storageData);

      callback({
        status: "ok",
        orderData,
        storageData,
        adsData: adsData?.data as any,
      });

      setShowPanel(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(`出错:${error.message}`);
        console.error(error);

        callback({
          status: "ok",
          message: error.message,
        });
      }
    }
  }

  return (
    <>
      <Spin spinning={spinning} description={spinningDescription} fullscreen />
      <Button
        type="dashed"
        variant="solid"
        shape="round"
        size="medium"
        onClick={() => setShowPanel(!showPanel)}
      >
        {showPanel ? "隐藏导入区" : "显示导入区"}
      </Button>
      <div
        className={cn(
          "p-5 bg-red-50 rounded-md",
          showPanel ? "h-auto" : "h-0! p-0! overflow-hidden",
        )}
      >
        <div className=" grid grid-cols-3 gap-5 mb-5">
          <div className="flex justify-start items-start relative p-2 bg-white rounded-md shadow-md">
            {!fileInputOrderName && (
              <div className="w-[300px] h-[100px]">
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
              <div className="w-full h-[100px] flex items-center justify-center pointer-events-non">
                <span className=" break-all ">{fileInputOrderName}</span>
                <Button
                  type="default"
                  shape="circle"
                  title="清除"
                  style={{ position: "absolute", top: 5, right: 5 }}
                  icon={<CloseOutlined />}
                  onClick={() => handleFileRemove("order")}
                />
              </div>
            )}
          </div>

          <div className="flex justify-start items-start relative p-2 bg-white rounded-md shadow-md">
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
              <div className="w-full h-[100px] flex items-center justify-center pointer-events-non">
                <span className=" break-all ">{fileInputStorageName}</span>

                <Button
                  type="default"
                  shape="circle"
                  title="清除"
                  style={{ position: "absolute", top: 5, right: 5 }}
                  icon={<CloseOutlined />}
                  onClick={() => handleFileRemove("storage")}
                />
              </div>
            )}
          </div>

          <div className="flex justify-start items-start relative p-2 bg-white rounded-md shadow-md">
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
              <div className="w-full h-[100px] flex items-center justify-center pointer-events-non">
                <span className=" break-all ">{fileInputAdsName}</span>

                <Button
                  type="default"
                  shape="circle"
                  title="清除"
                  style={{ position: "absolute", top: 5, right: 5 }}
                  icon={<CloseOutlined />}
                  onClick={() => handleFileRemove("ads")}
                />
              </div>
            )}
          </div>
        </div>

        <div className=" flex items-center justify-between py-2 px-4">
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
    </>
  );
}

export default LoadFileCsv;
