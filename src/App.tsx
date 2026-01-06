import LoadFileCsv from "@/components/loadFileCsv";
import ReprotShow from "@/components/ReportShow";
import type { CallbackPrams,ReprotItem } from "@/types/common";
import { ReportCalc } from "@/utils/calc";
import { useState } from "react";

function App() {
  const [reportList,setReportList] = useState<Array<ReprotItem>>([])

  function csvDataCallback({
    status,
    message,
    orderData,
    storageData,
  }: CallbackPrams) {
    if (status === "error") {
      console.error(message);
      return;
    }
    if (status === "ok") {
      if (orderData && storageData) {
        let ReportCalcInstance = new ReportCalc({ orderData, storageData });
        ReportCalcInstance.init();

        setReportList(ReportCalcInstance.getReportList())
      }
    }
  }
  return (
    <>
      <div className=" min-w-xl max-w-5xl m-auto">
        <LoadFileCsv callback={csvDataCallback} />
        <ReprotShow data={reportList} className=" mt-5" />
      </div>
    </>
  );
}

export default App;
