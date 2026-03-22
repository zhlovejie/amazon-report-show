import { cn } from "@/utils/classnames";
import Input from "antd/es/Input";
export interface MetricData {
  totalSales: number;
  totalReceived: number;
  exchangeRate: number;
  avgGrossMargin: number;
  skuCount: number;
}

interface MetricCardsProps {
  data: MetricData;
  className?: string;
  callback?:(val:string | number) => void
}

function MetricCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  subColor?: "green" | "red" | "gray";
}) {
  const subColorCls = {
    green: "text-emerald-600",
    red:   "text-red-500",
    gray:  "text-gray-400",
  }[subColor ?? "gray"];

  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-[22px] h-10 flex items-center justify-start font-medium text-gray-900 leading-none">{value}</div>
      {sub && <div className={cn("text-xs mt-1.5", subColorCls)}>{sub}</div>}
    </div>
  );
}

export default function MetricCards({ data, className,callback }: MetricCardsProps) {
  const { totalSales, totalReceived, exchangeRate, avgGrossMargin, skuCount } = data;

  const marginColor =
    avgGrossMargin >= 40 ? "green" : avgGrossMargin >= 20 ? "gray" : "red";

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      <MetricCard
        label="总销售额"
        value={`$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub="本月合计"
      />
      <MetricCard
        label="总回款"
        value={`$${totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub="实收金额"
        subColor="green"
      />
      <MetricCard
        label="汇率"
        value={
          <Input 
          styles={{
            "root":{
              "fontSize":"22px",
              "fontWeight":"500",
              "padding":"0",
              "width":"100%",
              "color":"#101828"
            }
          }}
          type="number"
          step={0.1}
          variant="borderless"
          value={exchangeRate.toString()} 
          onChange={ (event) => {
            let val = event.target.value
            callback && callback(val)
          }} />
        }
        sub="USD / CNY"
      />
      <MetricCard
        label="平均毛利率"
        value={`${avgGrossMargin.toFixed(1)}%`}
        sub={`${skuCount} 个 SKU`}
        subColor={marginColor}
      />
    </div>
  );
}
