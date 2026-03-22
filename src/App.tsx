import LoadFileCsv from "@/components/loadFileCsv";
import ReprotShow from "@/components/ReportShow";
import PendingList from "./components/PendingList";
// import BatchEditTable from "./components/TableTest";
import type { CallbackPrams,ReprotItem } from "@/types/common";
import { ReportCalc } from "@/utils/calc";
import { useMemo, useState } from "react";

function App() {
  const [reportList,setReportList] = useState<Array<ReprotItem>>([])
  const [pendingList,setPendingList] = useState<Array<ReprotItem>>([])
  const [pendingRepairList,setPendingRepairList] = useState<Array<ReprotItem>>([])

  const skuList = useMemo(() => {
    return reportList.map(item => item.__sku)
  },[reportList])

  //sku 列表
  //

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
      if (orderData && storageData) {
        ReportCalcInstance = new ReportCalc({ orderData, storageData });

        ReportCalcInstance.init();
        if(adsData){
          ReportCalcInstance.initCalcAds(adsData)
        }

        setReportList(ReportCalcInstance.getReportList())
        setPendingList(ReportCalcInstance.getPendingList())
      }

    }
  }

  function handlePendingRepairList(dataList:Array<ReprotItem>){
    setPendingRepairList(dataList)
  }
  
  return (
    <>
      <div className=" max-w-[80%] bg-white mx-auto my-5">
        <LoadFileCsv callback={csvDataCallback} />
        <ReprotShow data={reportList} repairDataList={pendingRepairList} className=" mt-5" />
        <PendingList data={pendingList} skulist={skuList} callback={handlePendingRepairList} className=" mt-5"/>
        {/* <BatchEditTable /> */}
      </div>
    </>
  );
}

export default App;
