import type { ReprotItem } from "@/types/common";
import { useEffect, useState } from "react";
import { cn } from "@/utils/classnames";
import SortAscIcon from "@/assets/sort-asc.svg";
import SortDescIcon from "@/assets/sort-desc.svg";
interface ReprotShowProps {
  data: Array<ReprotItem>;
  className?: string;
}

type sortType = "asc" | "desc";

// 定义表头配置类型
interface HeaderColumn {
  label: string;
  dataIndex: keyof ReprotItem; // 确保 dataIndex 是 ReprotItem 的键
  format?: ({}: any) => string;
  sortable?: true | false;
  sortType?: sortType;
}

function ReprotShow({ data, className }: ReprotShowProps) {
  const [reportData, setReportData] = useState<Array<ReprotItem>>([]);
  const [tableHeader, setTableHeader] = useState<Array<HeaderColumn>>([
    {
      label: "sku",
      dataIndex: "sku",
    },
    {
      label: "销量",
      dataIndex: "qty",
      sortable: true,
      sortType: "asc",
    },
    {
      label: "销售额",
      dataIndex: "productSales",
    },
    {
      label: "佣金",
      dataIndex: "sellingFees",
    },
    {
      label: "FBA配送费",
      dataIndex: "fbaFees",
    },
    {
      label: "退款",
      dataIndex: "refund",
    },
    {
      label: "退款数量",
      dataIndex: "refundQty",
    },
    {
      label: "退货率",
      dataIndex: "refundRate",
      format: ({ val }) => {
        return `${val}%`;
      },
      sortable: true,
      sortType: "asc",
    },
    {
      label: "清算",
      dataIndex: "Liquidations",
    },
    {
      label: "调整",
      dataIndex: "Adjustment",
    },
  ]);

  function getSortIcon(type: sortType) {
    if (type === "asc") {
      return <img src={SortAscIcon} alt="" className=" size-6 border-0" />;
    }

    if (type === "desc") {
      return <img src={SortDescIcon} alt="" className=" size-6 border-0" />;
    }
    return null;
  }

  function handleSort(header: HeaderColumn, type: sortType) {
    let _tableHeader = [...tableHeader];
    let _setReportData = [...reportData];
    let target = _tableHeader.find(
      (item) => item.dataIndex === header.dataIndex
    );
    if (target) {
      target.sortType = type;
      let _dataIndex = target.dataIndex;
      _setReportData.sort((d2, d1) => {
        if (target.sortType === "asc") {
          return (
            parseFloat(d2[_dataIndex] as string) -
            parseFloat(d1[_dataIndex] as string)
          );
        } else {
          return (
            parseFloat(d1[_dataIndex] as string) -
            parseFloat(d2[_dataIndex] as string)
          );
        }
      });
    }

    setTableHeader(_tableHeader);
    setReportData(_setReportData);
  }

  useEffect(() => {
    setReportData(data);
  }, [data]);

  if (reportData.length === 0) {
    return null
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {tableHeader.map((h) => {
              return (
                <th
                  key={h.dataIndex}
                  className="border border-gray-300 px-4 py-2 text-left"
                >
                  <div className="flex flex-row">
                    {h.label}
                    {h.sortable ? (
                      <span
                        className=" text-sm size-6 ml-1 cursor-pointer"
                        title={h.sortType === "asc" ? "升序" : "降序"}
                        onClick={() =>
                          handleSort(h, h.sortType === "asc" ? "desc" : "asc")
                        }
                      >
                        {getSortIcon(h.sortType as sortType)}
                      </span>
                    ) : null}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {reportData.map((item) => {
            return (
              <tr key={item.sku} className="hover:bg-gray-50">
                {tableHeader.map((h, idx) => {
                  return (
                    <td
                      key={h.dataIndex}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {h.format
                        ? h.format({ item, val: item[h.dataIndex], idx })
                        : item[h.dataIndex]}
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

export default ReprotShow;
