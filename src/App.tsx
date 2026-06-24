import LoadFileCsv from "@/components/loadFileCsv";
import ReprotShow from "@/components/ReportShow";
import PendingList from "./components/PendingList";
import PageBackGuard from "./components/PageBackGuard"
import RagChat from "./components/RgaAmazonChat"
import { Button, Drawer } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import type {
  CallbackPrams,
  ReprotItem,
  IReportSourceData,
} from "@/types/common";
import { ReportCalc } from "@/utils/calc";
import { useMemo, useState } from "react";

function App() {
  const [reportList, setReportList] = useState<Array<ReprotItem>>([]);
  const [pendingList, setPendingList] = useState<Array<ReprotItem>>([]);
  const [ragChatOpen, setRagChatOpen] = useState(false);
  const [pendingRepairList, setPendingRepairList] = useState<Array<ReprotItem>>(
    [],
  );

  // 原始数据计算总回款
  const [reportSourceData, setReportSourceData] = useState<IReportSourceData>({
    payment: "0",
    ads: "0",
    storage: "0",
  });

  const skuList = useMemo(() => {
    return reportList.map((item) => item.__sku);
  }, [reportList]);

  //sku 列表
  //

  function csvDataCallback({
    status,
    message,
    orderData,
    storageData,
    adsData,
  }: CallbackPrams) {
    if (status === "error") {
      console.error(message);
      return;
    }
    let ReportCalcInstance = null;
    if (status === "ok") {
      if (orderData && storageData) {
        ReportCalcInstance = new ReportCalc({ orderData, storageData });

        ReportCalcInstance.init();
        if (adsData) {
          ReportCalcInstance.initCalcAds(adsData);
        }

        setReportList(ReportCalcInstance.getReportList());
        setPendingList(ReportCalcInstance.getPendingList());
        setReportSourceData(ReportCalcInstance.getSourceData());
      }
    }
  }

  function handlePendingRepairList(dataList: Array<ReprotItem>) {
    setPendingRepairList(dataList);
  }

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<RobotOutlined />}
        aria-label="AI 助手"
        title="AI 助手"
        onClick={() => setRagChatOpen(true)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          boxShadow: "0 10px 24px rgba(22, 119, 255, 0.28)",
        }}
      />

      <Drawer
        title="AI 助手"
        placement="right"
        width="min(92vw, 960px)"
        open={ragChatOpen}
        onClose={() => setRagChatOpen(false)}
        styles={{
          body: {
            padding: 0,
            overflow: "hidden",
          },
        }}
      >
        <RagChat />
      </Drawer>

      <div className=" max-w-[80%] bg-white mx-auto my-5">
        <PageBackGuard />
        <LoadFileCsv callback={csvDataCallback} />
        <ReprotShow
          data={reportList}
          repairDataList={pendingRepairList}
          reportSourceData={reportSourceData}
          className=" mt-5"
        />
        <PendingList
          data={pendingList}
          skulist={skuList}
          callback={handlePendingRepairList}
          className=" mt-5"
        />
      </div>
    </>
  );
}

export default App;
