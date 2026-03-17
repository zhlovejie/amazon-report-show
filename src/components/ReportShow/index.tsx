import type { ReprotItem } from "@/types/common";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/classnames";
import SortAscIcon from "@/assets/sort-asc.svg";
import SortDescIcon from "@/assets/sort-desc.svg";
import Button from "@/components/Button";
import { useImmer } from "use-immer";
import Decimal from "decimal.js";
interface ReprotShowProps {
  data: Array<ReprotItem>;
  className?: string;
}

type sortType = "asc" | "desc";
type EditActions = "edit" | "save" | "cancel";
// 定义表头配置类型
interface HeaderColumn {
  label: string;
  dataIndex: keyof ReprotItem; // 确保 dataIndex 是 ReprotItem 的键
  width?: number;
  format?: ({}: any) => string;
  sortable?: true | false;
  sortType?: sortType;
  edit?: boolean;
  editStatus?: EditActions;
  fixedLeft?: number;
  fixedRight?: number;
}

function ReprotShow({ data, className }: ReprotShowProps) {
  //--table固定列功能-----------------------------------------------
  const LEFT_SHADOW = "2px 0 6px -2px rgba(0,0,0,0.25)";
  const RIGHT_SHADOW = "-2px 0 6px -2px rgba(0,0,0,0.25)";
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrollEnd, setIsScrollEnd] = useState(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    setScrollLeft(scrollLeft);
    // ✅ 判断是否滚到底：scrollLeft + 可视宽度 >= 总宽度（留 1px 误差）
    setIsScrollEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  };

  const getStickyStyle = (col: HeaderColumn, isHeader = false) => {
    const bg = isHeader ? "#f9fafb" : "#fff";
    if (col.fixedLeft !== undefined)
      return {
        position: "sticky" as const,
        left: col.fixedLeft,
        zIndex: isHeader ? 20 : 10,
        backgroundColor: bg,
        boxShadow: scrollLeft > 0 ? LEFT_SHADOW : "none",
      };
    if (col.fixedRight !== undefined)
      return {
        position: "sticky" as const,
        right: col.fixedRight,
        zIndex: isHeader ? 20 : 10,
        backgroundColor: bg,
        boxShadow: isScrollEnd ? "none" : RIGHT_SHADOW,
        borderLeft: isScrollEnd ? "none" : "1px solid #e5e7eb",
      };
    return { backgroundColor: bg, position: "relative" as const, zIndex: 0 };
  };
  //--table固定列功能-----------------------------------------------

  const timeTravel = useRef<Array<Array<ReprotItem>>>([]);

  const [reportData, setReportData] = useImmer<Array<ReprotItem>>([]);

  const [tableHeader, setTableHeader] = useImmer<Array<HeaderColumn>>([
    {
      label: "名称",
      dataIndex: "__name",
      width: 110,
      fixedLeft: 0,
    },
    {
      label: "fnsku",
      dataIndex: "__fnsku",
      width: 110,
      fixedLeft: 144,
    },
    {
      label: "asin",
      dataIndex: "__asin",
      width: 110,
      fixedLeft: 288,
    },
    {
      label: "sku",
      dataIndex: "sku",
      width: 150,
      fixedLeft: 432,
    },
    {
      label: "销量",
      dataIndex: "qty",
      sortable: true,
      sortType: "asc",
      width: 110,
    },
    {
      label: "销售额($)",
      dataIndex: "productSales",
      width: 110,
    },
    {
      label: "佣金($)",
      dataIndex: "sellingFees",
      width: 110,
    },
    {
      label: "FBA配送费($)",
      dataIndex: "fbaFees",
      width: 110,
    },
    {
      label: "其他($)",
      dataIndex: "others",
      width: 110,
    },
    {
      label: "退款($)",
      dataIndex: "refund",
      width: 110,
    },
    {
      label: "退款数量",
      dataIndex: "refundQty",
      width: 110,
    },
    {
      label: "退货率",
      dataIndex: "refundRate",
      format: ({ val }) => {
        return `${val}%`;
      },
      sortable: true,
      sortType: "asc",
      width: 110,
    },
    {
      label: "清算($)",
      dataIndex: "Adjustment",
      width: 110,
    },
    {
      label: "基础广告费($)",
      dataIndex: "Cost_of_Advertising",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "基础广告费其它($)",
      dataIndex: "Cost_of_Advertising_other",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "秒杀费($)",
      dataIndex: "Deal",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "Vine($)",
      dataIndex: "Vine_Enrollment_Fee",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "(新)优惠券绩效费($)",
      dataIndex: "Coupon_Performance_Based_Fee",
      width: 130,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "(新)优惠券参与费($)",
      dataIndex: "Coupon_Participation_Fee",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "(旧)优惠券($)",
      dataIndex: "Coupon_Redemption_Fee",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "存储费($)",
      dataIndex: "StorageFee",
      width: 110,
    },

    {
      label: "FBA移除订单：弃置费($)",
      dataIndex: "Disposal_Fee",
      width: 200,
      edit: true,
      editStatus: "cancel",
    },

    {
      label: "FBA交易费用($)",
      dataIndex: "FBA_Transaction_fees",
      width: 150,
      edit: true,
      editStatus: "cancel",
    },

    {
      label: "清货($)",
      dataIndex: "Liquidations",
      width: 110,
    },

    {
      label: "订单退款撤销($)",
      dataIndex: "Order_Retrocharge",
      width: 150,
      edit: true,
      editStatus: "cancel",
    },

    {
      label: "入库配置费($)",
      dataIndex: "FBA_Inbound_Placement_Service_Fee",
      width: 140,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "回款($)",
      dataIndex: "extra_payment_collection",
      width: 110,
    },
    {
      label: "进价(RMB)",
      dataIndex: "extra_purchase_price",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "重量(g)",
      dataIndex: "extra_weight",
      width: 110,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "国内物流(RMB)",
      dataIndex: "extra_inside_express_price",
      width: 150,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "海运报价(RMB)",
      dataIndex: "extra_shipping_price",
      width: 150,
      edit: true,
      editStatus: "cancel",
    },
    {
      label: "海运费(RMB)",
      dataIndex: "extra_shipping_fee",
      width: 110,
    },
    {
      label: "单个成本(RMB)",
      dataIndex: "extra_single_cost_price",
      width: 150,
    },

    {
      label: "成本(RMB)",
      dataIndex: "extra_rmb_cost",
      width: 110,
    },
    {
      label: "成本($)",
      dataIndex: "extra_doller_cost",
      width: 110,
    },
    {
      label: "毛利润",
      dataIndex: "extra_gross_profit",
      width: 110,
    },
    {
      label: "毛利率",
      dataIndex: "extra_rate_of_gross_profit",
      format: ({ val }) => {
        return `${val}%`;
      },
      width: 110,
      fixedRight: 0,
    },
  ]);

  // 美元对人民币汇率
  const [usdCnyRate, setUsdCnyRate] = useImmer<number | string>(6.9);
  // 总销售额
  const [totalProductSales, setTotalProductSales] = useImmer<number | string>(
    0,
  );
  // 总回款
  const [totalExtraPaymentCollection, setTotalExtraPaymentCollection] =
    useImmer<number | string>(0);

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
    setTableHeader((draft) => {
      const target = draft.find((item) => item.dataIndex === header.dataIndex);
      if (target) target.sortType = type;
    });
    setReportData((draft) => {
      draft.sort((a, b) => {
        const va = parseFloat(a[header.dataIndex] as string);
        const vb = parseFloat(b[header.dataIndex] as string);
        return type === "asc" ? va - vb : vb - va;
      });
    });
  }

  function combineHeaderStyle(header: HeaderColumn) {
    if (header.width && header.edit) {
      return {
        width: `${header.width + 110}px`,
      };
    }
    if (header.width) {
      return {
        width: `${header.width}px`,
      };
    }
    return {
      width: "auto",
    };
  }

  function handleEditAction(action: EditActions, header: HeaderColumn) {
    if (action === "edit") {
      setTableHeader((draft) => {
        let target = draft.find((item) => item.dataIndex === header.dataIndex);
        if (target) {
          target.editStatus = "edit";
        }
      });
      timeTravel.current = [...timeTravel.current, reportData].slice(-5);
      return;
    }
    if (action === "save") {
      setTableHeader((draft) => {
        let target = draft.find((item) => item.dataIndex === header.dataIndex);
        if (target) {
          target.editStatus = "save";
        }
      });
      updateCalc();
      return;
    }

    if (action === "cancel") {
      setTableHeader((draft) => {
        let target = draft.find((item) => item.dataIndex === header.dataIndex);
        if (target) {
          target.editStatus = "cancel";
        }
      });
      if (timeTravel.current.length > 0) {
        let prevReportData = timeTravel.current.pop();
        if (prevReportData) {
          setReportData(prevReportData);
        }
      }
      return;
    }
  }

  function handleInputChange(
    event: React.FormEvent<HTMLInputElement>,
    rowIdx: number,
    dataIndex: string,
  ) {
    const value = (event.target as HTMLInputElement).value;
    setReportData((draft) => {
      draft[rowIdx][dataIndex] = value;
      return draft;
    });
  }

  function updateCalc() {
    setReportData((draft) => {
      draft.forEach((item, i) => {
        const result = [
          calc_extra_payment_collection,
          calc_extra_shipping_fee,
          calc_extra_single_cost_price,
          calc_extra_rmb_cost,
          calc_extra_doller_cost,
          calc_extra_gross_profit,
          calc_extra_rate_gross_profit,
        ].reduce((acc, fn) => fn(acc), { ...item });

        Object.assign(draft[i], result);
      });
    });
  }

  // 辅助工具：安全转 Decimal，防止空字符串或 undefined 报错
  const D = (val: string | number | undefined) => new Decimal(val || 0);

  /**
   * 计算回款
   */
  function calc_extra_payment_collection(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_payment_collection: D(item.productSales as string)
        .add(D(item.sellingFees as string))
        .add(D(item.fbaFees as string))
        .add(D(item.others as string))
        .add(D(item.refund as string))
        .add(D(item.Adjustment as string))
        .add(D(item.Cost_of_Advertising as string))
        .add(D(item.Cost_of_Advertising_other as string))
        .add(D(item.Deal as string))
        .add(D(item.Vine_Enrollment_Fee as string))
        .add(D(item.Coupon_Performance_Based_Fee as string))
        .add(D(item.Coupon_Participation_Fee as string))
        .add(D(item.Coupon_Redemption_Fee as string))
        .add(D(item.StorageFee as string))
        .add(D(item.Disposal_Fee as string))
        .add(D(item.FBA_Transaction_fees as string))
        .add(D(item.Liquidations as string))
        .add(D(item.Order_Retrocharge as string))
        .add(D(item.FBA_Inbound_Placement_Service_Fee as string))
        .toFixed(4),
    };
  }

  /**
   * 计算海运费
   */
  function calc_extra_shipping_fee(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_shipping_fee: D(item.extra_weight as string)
        .div(1000)
        .mul(D(item.extra_shipping_price as string))
        .toFixed(4),
    };
  }

  /**
   * 计算单个成本
   */
  function calc_extra_single_cost_price(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_single_cost_price: D(item.extra_purchase_price as string)
        .add(D(item.extra_inside_express_price as string))
        .add(D(item.extra_shipping_fee as string))
        .toFixed(4),
    };
  }

  /**
   * 计算总成本RMB
   */
  function calc_extra_rmb_cost(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_rmb_cost: D(item.extra_single_cost_price as string)
        .mul(D(item.qty as number))
        .toFixed(4),
    };
  }

  /**
   * 计算总成本美元
   */
  function calc_extra_doller_cost(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_doller_cost: D(item.extra_rmb_cost as string)
        .div(D(usdCnyRate))
        .toFixed(4),
    };
  }

  /**
   * 计算毛利
   */
  function calc_extra_gross_profit(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_gross_profit: D(item.extra_payment_collection as string)
        .minus(D(item.extra_doller_cost as string))
        .toFixed(4),
    };
  }

  /**
   * 计算毛利、毛利率
   */
  function calc_extra_rate_gross_profit(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_rate_of_gross_profit: D(item.extra_gross_profit as string)
        .div(D(item.productSales))
        .mul(100)
        .toFixed(4),
    };
  }

  /**
   * 计算 总销售额、总回款
   */
  function calc_total() {
    let n1 = D(0),
      n2 = D(0);

    reportData.forEach((item) => {
      n1 = n1.add(D(item.productSales as string));
      n2 = n2.add(D(item.extra_payment_collection as string));
    });

    setTotalProductSales(n1.toFixed(2));
    setTotalExtraPaymentCollection(n2.toFixed(2));
    console.log(`setTotalProductSales:${n1.toFixed(2)}`);
    console.log(`setTotalExtraPaymentCollection:${n2.toFixed(2)}`);
  }

  useEffect(() => {
    console.log(`data 改变触发...`);
    setReportData(data);
    timeTravel.current = [data];
    updateCalc();
  }, [data]);

  useEffect(() => {
    console.log(`usdCnyRate 改变触发...`);
    updateCalc();
  }, [usdCnyRate]);

  useEffect(() => {
    console.log(`reportData 改变触发...`);
    calc_total();
  }, [reportData]);

  if (reportData.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-112.5 overflow-auto mt-5">
        <table className=" w-full border-collapse border border-gray-200 overflow-scroll">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                总销售额
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                总回款
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                汇率
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="">
              <td className="border border-gray-300 px-4 py-2">
                {totalProductSales}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {totalExtraPaymentCollection}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  placeholder="请输入汇率"
                  value={usdCnyRate}
                  onChange={(event) => setUsdCnyRate(event.target.value)}
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        onScroll={handleScroll}
        className={cn("w-full overflow-auto", className)}
      >
        <table
          className="border-collapse border border-gray-200 overflow-scroll"
          style={{
            borderCollapse: "separate", // ✅ 关键：改为 separate
            borderSpacing: 0, // ✅ 间距设 0 模拟 collapse 效果
            width: "max-content",
            minWidth: "100%",
          }}
        >
          <thead>
            <tr className="bg-gray-100">
              {tableHeader.map((h) => {
                return (
                  <th
                    key={h.dataIndex}
                    className="border border-gray-300 px-4 py-2 text-left"
                    style={{ ...getStickyStyle(h, true) }}
                  >
                    <div
                      className="flex flex-row relative"
                      style={{ ...combineHeaderStyle(h) }}
                    >
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
                      {h.edit ? (
                        <div className=" ml-2 flex gap-1">
                          {h.editStatus === "edit" ? (
                            <>
                              <Button
                                key="btn-save"
                                size="xs"
                                variant="solid"
                                rounded="sm"
                                onClick={() => handleEditAction("save", h)}
                              >
                                确定
                              </Button>
                              <Button
                                key="btn-cancel"
                                size="xs"
                                variant="outline"
                                rounded="sm"
                                onClick={() => handleEditAction("cancel", h)}
                              >
                                取消
                              </Button>
                            </>
                          ) : (
                            <Button
                              key="btn-edit"
                              size="xs"
                              variant="outline"
                              rounded="sm"
                              onClick={() => handleEditAction("edit", h)}
                            >
                              编辑
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {reportData.map((item, pIndex) => {
              return (
                <tr key={item.sku} className="hover:bg-gray-200">
                  {tableHeader.map((h, idx) => {
                    return (
                      <td
                        key={h.dataIndex}
                        className="border border-gray-300 px-4 py-2"
                        style={{ ...getStickyStyle(h, false) }}
                      >
                        {h.edit && h.editStatus === "edit" && (
                          <input
                            type="text"
                            placeholder="请输入内容..."
                            value={item[h.dataIndex] as any}
                            onInput={(event) =>
                              handleInputChange(
                                event,
                                pIndex,
                                h.dataIndex as string,
                              )
                            }
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          />
                        )}

                        {!(h.edit && h.editStatus === "edit") &&
                          (h.format
                            ? h.format({ item, val: item[h.dataIndex], idx })
                            : item[h.dataIndex])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ReprotShow;
