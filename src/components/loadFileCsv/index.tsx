import { useRef, useState } from "react";
import Papa from "papaparse";
import type { CallbackPrams } from "@/types/common";
import { loadOrderByMock, loadStorageByMock } from "@/mockdata/test";
type LoadFileCsvProps = {
  callback: (params: CallbackPrams) => void;
};

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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const elementName = event.target.name;
    const files = event.target.files;

    if (files && files.length > 0) {
      switch (elementName) {
        case "orderfile":
          setSelectedOrderFile(files[0]);
          break;
        case "storagefile":
          setSelectedStorageFile(files[0]);
          break;
        default:
          break;
      }
    }

    // setTimeout(function () {
    //   event.target.value = "";
    // }, 500);
  }

  function parseFile(file: File | string): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          console.log("解析完成.");
          resolve(results.data as Array<any>);
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
      const orderData = await parseFile(await loadOrderByMock());
      const storageData = await parseFile(await loadStorageByMock());
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
      const orderData = await parseFile(selectedOrderFile);
      const storageData = await parseFile(selectedStorageFile);
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
      <div className="file-wrapper">
        <div>
          <input
            ref={fileInputOrderRef}
            accept=".csv"
            type="file"
            name="orderfile"
            id="orderfile"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <input
            ref={fileInputStorageRef}
            accept=".csv"
            type="file"
            name="storagefile"
            id="storagefile"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <button onClick={initFilesData}>开始</button>
        </div>
      </div>
    </>
  );
}

export default LoadFileCsv;
