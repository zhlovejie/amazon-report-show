import LoadFileCsv from "@/components/loadFileCsv";
import ReprotShow from "@/components/ReportShow";
import PendingList from "./components/PendingList";
import type { CallbackPrams,ReprotItem } from "@/types/common";
import { ReportCalc } from "@/utils/calc";
import { useState } from "react";

function App() {
  const [reportList,setReportList] = useState<Array<ReprotItem>>([])
  const [pendingList,setPendingList] = useState<Array<ReprotItem>>([])

  function csvDataCallback({
    status,
    message,
    orderData,
    storageData,
    adsData
  }: CallbackPrams) {
    if (status === "error") {
      console.error(message);
      return;
    }
    let ReportCalcInstance = null
    if (status === "ok") {
      if (orderData && storageData && adsData) {
        ReportCalcInstance = new ReportCalc({ orderData, storageData });
        ReportCalcInstance.init();
        ReportCalcInstance.initCalcAds(adsData)

        setReportList(ReportCalcInstance.getReportList())
        setPendingList(ReportCalcInstance.getPendingList())
      }


      // if(adsData){
      //   if(ReportCalcInstance !== null){
      //     ReportCalcInstance.initCalcAds(adsData)
      //     setReportList(ReportCalcInstance.getReportList())
      //     setPendingList(ReportCalcInstance.getPendingList())
      //   }
      // }
    }
  }
  
  return (
    <>
      <div className=" bg-white m-5">
        <LoadFileCsv callback={csvDataCallback} />
        <ReprotShow data={reportList} className=" mt-5" />
        <PendingList data={pendingList} className=" mt-5"/>
      </div>
    </>
  );
}

export default App;
