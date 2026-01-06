import { useRef, useState } from "react";
import Papa from "papaparse";
import numbro from "numbro"
import {CURRENCY_FORMATTER_OBJECT} from "@/types/common";
import { loadOrderByMock, loadStorageByMock } from "@/mockdata/test";
import Button from "@/components/Button";


type CallbackPrams = {
  status: "ok" | "error";
  message?:string;
  orderData?:Array<any>;
  storageData?:Array<any>;
};

type LoadFileCsvProps = {
  callback: (params: CallbackPrams) => void;
};

type ReportFileType = "order" | "storage" | "advertisement";

/**
 * 上传文件，返回解析csv数据
 * @param param0
 * @returns
 */
function LoadFileCsv({ callback }: LoadFileCsvProps) {
  const IS_TEST_MODEL = true;

  const [selectedOrderFile, setSelectedOrderFile] = useState<File | null>(null);
  const [selectedStorageFile, setSelectedStorageFile] = useState<File | null>(
    null
  );
  const fileInputOrderRef = useRef<HTMLInputElement>(null);
  const fileInputStorageRef = useRef<HTMLInputElement>(null);

  const [fileInputOrderName, setFileInputOrderName] = useState<string | null>(
    null
  );
  const [fileInputStorageName, setFileInputStorageName] = useState<
    string | null
  >(null);

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
    if (type === "advertisement") {
      return;
    }
  }

  function parseFile(file: File | string,type:ReportFileType): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        skipEmptyLines:true,
        header: true,
        transform: function (value, column) {
          // 处理货币类型数据 例如：-1,013.48  去除逗号
          let column_list = CURRENCY_FORMATTER_OBJECT[type] as string[]

          if(Array.isArray(column_list) && column_list.length > 0){
            let column_str = String(column).trim()
            if(column_list.includes(column_str)){
              return String(numbro.unformat(value))
            }
          }
          return value
        },
        complete: function ({data,errors,meta}) {
          console.log("解析完成.",data);
          console.log("解析元数据",meta)
          if(errors.length > 0){
            reject(new Error(errors[0].message));
          }else{
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
    if (IS_TEST_MODEL) {
      const orderData = await parseFile(await loadOrderByMock(),'order');
      const storageData = await parseFile(await loadStorageByMock(),'storage');
      // console.log(orderData);
      // console.log(storageData);

      callback({
        status: "ok",
        orderData,
        storageData,
      });

      return;
    }

    if (!selectedOrderFile) {
      alert("请上传销售报表");
      return;
    }
    if (!selectedStorageFile) {
      alert("请上传仓储报表");
      return;
    }

    try {
      const orderData = await parseFile(selectedOrderFile,'order');
      const storageData = await parseFile(selectedStorageFile,'storage');
      // console.log(orderData);
      // console.log(storageData);

      callback({
        status: "ok",
        orderData,
        storageData,
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(`文件解析出错:${error.message}`);
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
      <div className=" p-5 border-2 border-dashed border-b-gray-700 rounded-md ">
        <div className="text-2xl mb-2.5">报表导入区</div>

        <div className=" grid grid-cols-3 gap-5 mb-5">
          <div className="flex justify-start items-start bg-amber-50 relative py-2 px-5 rounded-md">
            {!fileInputOrderName && (
              <>
                <input
                  className=" opacity-0 absolute top-1 left-1 right-1 bottom-1 cursor-pointer"
                  ref={fileInputOrderRef}
                  accept=".csv"
                  type="file"
                  name="orderfile"
                  id="orderfile"
                  onChange={handleFileChange}
                />

                <div>上传销售报表</div>
              </>
            )}
            {fileInputOrderName && (
              <>
                <div className=" flex flex-col">
                  <span>销售报表:</span>
                  <span className=" break-all ">{fileInputOrderName}</span>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  rounded="full"
                  className=" absolute top-[-15px] right-[-15px]"
                  onClick={() => handleFileRemove("order")}
                >
                  删除
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-start items-start bg-amber-50 relative py-2 px-5 rounded-md">
            {!fileInputStorageName && (
              <>
                <input
                  className=" opacity-0 absolute top-1 left-1 right-1 bottom-1 cursor-pointer"
                  ref={fileInputStorageRef}
                  accept=".csv"
                  type="file"
                  name="storagefile"
                  id="storagefile"
                  onChange={handleFileChange}
                />

                <div>上传仓储报表</div>
              </>
            )}
            {fileInputStorageName && (
              <>
                <div className=" flex flex-col">
                  <span>仓储报表:</span>
                  <span className=" break-all ">{fileInputStorageName}</span>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  rounded="full"
                  className=" absolute top-[-15px] right-[-15px]"
                  onClick={() => handleFileRemove("storage")}
                >
                  删除
                </Button>
              </>
            )}
          </div>
        </div>
        <div className=" text-center">
          <Button color="primary" onClick={initFilesData}>
            开始统计
          </Button>
        </div>
      </div>
    </>
  );
}

export default LoadFileCsv;
