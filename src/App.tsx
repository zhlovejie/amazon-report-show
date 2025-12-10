
import LoadFileCsv from "@/components/loadFileCsv"
import type { CallbackPrams } from "@/types/common";
import {ReportCalc} from "@/utils/calc"
function App() {

  // const [orderData,setOrderData] = 

  function csvDataCallback({status,message,orderData,storageData}:CallbackPrams){
    if(status === 'error'){
      console.error(message)
      return
    }
    if(status === 'ok'){
      console.log(orderData)
      console.log(storageData)
      if(orderData && storageData){
        let ReportCalcInstance =  new ReportCalc({orderData, storageData })
        ReportCalcInstance.init()
      }
    }
  }
  return (
    <>
      <LoadFileCsv callback={csvDataCallback}/>
    </>
  )
}

export default App
