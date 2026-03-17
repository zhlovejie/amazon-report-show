import type { ReprotItem } from "@/types/common";
import { useEffect, useState } from "react";
import { cn } from "@/utils/classnames";
import Button from "@/components/Button";
interface PendingListProps {
  data: Array<ReprotItem>;
  className?: string;
}

// 定义表头配置类型
interface HeaderColumn {
  label: string;
  dataIndex: keyof ReprotItem; // 确保 dataIndex 是 ReprotItem 的键
  format?: ({}: any) => string;
}

function PendingList({ data, className }: PendingListProps) {
  const [reportData, setReportData] = useState<Array<ReprotItem>>([]);
  const [tableHeader] = useState<Array<HeaderColumn>>([
    {
      label: "序号",
      dataIndex: "__order__",
    },
    {
      label: "type",
      dataIndex: "type",
    },
    {
      label: "order id",
      dataIndex: "order id",
    },
    {
      label: "sku",
      dataIndex: "sku",
    },
    {
      label: "description",
      dataIndex: "description",
    },
    {
      label: "total",
      dataIndex: "total",
    },
    {
      label: "操作",
      dataIndex: "__actions__",
    },
  ]);

  function renderBodyData(
    rowData: ReprotItem,
    rowIdx: number,
    headData: HeaderColumn,
    headIdx: number,
  ) {
    if (headData.dataIndex === "__order__") {
      return rowIdx + 1;
    }
    if (headData.dataIndex === "__actions__") {
      return (
        <div className="__actions__">
          <Button size="sm" variant="outline" rounded="sm" onClick={() => {}}>
            处理
          </Button>
        </div>
      );
    }

    return headData.format
      ? headData.format({ rowData, val: rowData[headData.dataIndex], headIdx })
      : rowData[headData.dataIndex];
  }

  useEffect(() => {
    setReportData(data);
  }, [data]);

  if (reportData.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse border border-gray-200">
        <caption className=" text-left">共有【 {reportData.length} 】条待处理数据</caption>
        <thead>
          <tr className="bg-gray-100">
            {tableHeader.map((h) => {
              return (
                <th
                  key={h.dataIndex}
                  className="border border-gray-300 px-4 py-2 text-left"
                >
                  <div className="flex flex-row">{h.label}</div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {reportData.map((item, pIdx) => {
            return (
              <tr key={`${pIdx}-${item.sku}`} className="hover:bg-gray-50">
                {tableHeader.map((h, idx) => {
                  return (
                    <td
                      key={h.dataIndex}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {renderBodyData(item, pIdx, h, idx)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PendingList;
