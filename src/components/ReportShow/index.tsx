import type {
  ReprotItem,
  CategoryTableRow,
  IReportSourceData,
} from "@/types/common";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/classnames";
// import Button from "@/components/Button";
import {
  Input,
  Table,
  Space,
  Typography,
  Tooltip,
  Button,
  Checkbox,
  type CheckboxOptionType,
  Popover,
  Alert,
  message,
} from "antd";
import type { ColumnsType, TableRef } from "antd/es/table";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import MetricCards from "../MetricCards";
import { CopyButton } from "../CopyButton";
import CategoryTableList from "../CategoryTableList";
import { useImmer } from "use-immer";
import Decimal from "decimal.js";

import {
  columnsSimpleList,
  copyToClipboard,
  calcSummaryData,
} from "@/utils/common";

import { runCalcPipeline, calcTotalFromSnapshot } from "./calc";

import { TableSummaryRow } from "@/components/TableSummaryRow";

interface ReprotShowProps {
  data: Array<ReprotItem>;
  repairDataList: Array<ReprotItem>;
  className?: string;
  reportSourceData: IReportSourceData;
}

// 配置显示列功能-------------------------
// ✅ 提到组件外部，只计算一次
const DEFAULT_CHECKED_LIST = columnsSimpleList
  .map((item) => item.dataIndex)
  .filter((key) => !["__fnsku", "__asin", "sku"].includes(key));

const CHECKBOX_OPTIONS = columnsSimpleList.map(({ dataIndex, title }) => ({
  label: title,
  value: dataIndex,
}));

/**配置限制  快速跳转到列 */
const FAST_COLUMN_KEY_LIST = [
  "Cost_of_Advertising",
  "AdvertisingRate",
  "StorageFee",
  "extra_payment_collection",
  "extra_rate_of_gross_profit",
].map((key) => {
  let target = columnsSimpleList.find((col) => col.dataIndex === key);
  return target;
});

function ReprotShow({
  data,
  className,
  repairDataList,
  reportSourceData,
}: ReprotShowProps) {
  const tableRef = useRef<TableRef>(null);
  const [reportData, setReportData] = useImmer<Array<ReprotItem>>([]);

  const [categtoryProductData, setCategtoryProductData] = useImmer<
    Array<CategoryTableRow>
  >([]);

  // 记录鼠标移动到当前row
  const [currentRow, setCurrentRow] = useState<ReprotItem>();
  // 记录当前处于编辑状态的列名（dataIndex）
  const [editingColumn, setEditingColumn] = useState<keyof ReprotItem | null>(
    null,
  );
  // 暂存该列所有行的修改：{ rowKey: newValue }
  const [tempColumnData, setTempColumnData] = useState<Record<string, string>>(
    {},
  );

  // 1. 开启某一列的编辑
  const startEditColumn = (field: keyof ReprotItem) => {
    const initTemp: Record<string, string> = {};
    reportData.forEach((item) => {
      initTemp[item.__key] = item[field] as string; // 拷贝当前列数据到临时状态
    });
    setTempColumnData(initTemp);
    setEditingColumn(field);
  };

  // 2. 保存该列的修改
  const saveColumn = () => {
    if (!editingColumn) return;

    const rate = usdCnyRateRef.current; // ✅ 读最新汇率
    setReportData((draft) => {
      draft.forEach((item) => {
        item[editingColumn] = tempColumnData[item.__key];
      });

      // ✅ 保存完立即重跑计算管线，在同一个 immer draft 内完成
      draft.forEach((item, i) => {
        Object.assign(draft[i], runCalcPipeline(item, rate));
      });
    });
    setEditingColumn(null);
    // message.success(`列 [${editingColumn}] 修改成功`);
  };

  // 3. 取消编辑
  const cancelEdit = () => {
    setEditingColumn(null);
    setTempColumnData({});
  };

  // 渲染列标题的通用函数
  const renderTitle = (title: string, field: keyof ReprotItem) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{title}</span>
      {editingColumn === field ? (
        <Space size={4}>
          <Typography.Link onClick={saveColumn}>
            <Tooltip title="保存" color="#108ee9">
              <SaveOutlined />
            </Tooltip>
          </Typography.Link>
          <Typography.Link onClick={cancelEdit}>
            <Tooltip title="取消" color="#108ee9">
              <CloseOutlined style={{ color: "red" }} />
            </Tooltip>
          </Typography.Link>
        </Space>
      ) : (
        <Typography.Link onClick={() => startEditColumn(field)}>
          <Tooltip title="编辑" color="#108ee9">
            <EditOutlined />
          </Tooltip>
        </Typography.Link>
      )}
    </div>
  );

  const renderEditableCell = (
    text: string,
    record: ReprotItem,
    columnKey: string,
  ) => {
    return editingColumn === columnKey ? (
      <Input
        className="font-medium text-gray-800 whitespace-nowrap"
        value={tempColumnData[record.__key]}
        onChange={(e) =>
          setTempColumnData({
            ...tempColumnData,
            [record.__key]: e.target.value,
          })
        }
      />
    ) : (
      <span className="font-medium text-gray-800 whitespace-nowrap">
        {text}
      </span>
    );
  };

  const columns = useMemo<ColumnsType<ReprotItem>>(() => {
    return [
      {
        title: "名称",
        dataIndex: "__name",
        width: 110,
        fixed: "start",
        onHeaderCell: () => ({
          style: { color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
      },
      {
        title: "fnsku",
        dataIndex: "__fnsku",
        width: 110,
        fixed: "start",
        onHeaderCell: () => ({
          style: { color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="text-gray-500 font-medium text-xs whitespace-nowrap">
              {text}
            </span>
          );
        },
      },
      {
        title: "asin",
        dataIndex: "__asin",
        width: 110,
        fixed: "start",
        onHeaderCell: () => ({
          style: { color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="text-gray-500 font-medium text-xs whitespace-nowrap">
              {text}
            </span>
          );
        },
      },
      {
        title: "sku",
        dataIndex: "sku",
        width: 130,
        fixed: "start",
        onHeaderCell: () => ({
          style: { color: "#73726c" },
        }),
        render: (text: string, record: ReprotItem) => {
          let isCurrentRow = currentRow && currentRow.__key === record.__key;
          return (
            <div className=" relative flex items-center justify-between">
              <span className="text-gray-500 font-medium text-xs whitespace-nowrap mr-1">
                {text}
              </span>
              <CopyButton
                className={cn(isCurrentRow ? " opacity-100" : " opacity-0")}
                text={text}
              />
            </div>
          );
        },
      },
      {
        title: "销量",
        dataIndex: "qty",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "销售额",
        dataIndex: "productSales",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "佣金",
        dataIndex: "sellingFees",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "FBA配送费",
        dataIndex: "fbaFees",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "其他",
        dataIndex: "others",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "退款",
        dataIndex: "refund",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "退款数量",
        dataIndex: "refundQty",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "退货率",
        dataIndex: "refundRate",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text} %
            </span>
          );
        },
        width: 110,
      },
      {
        dataIndex: "Adjustment",
        title: () => renderTitle("清算", "Adjustment"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Adjustment"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 110,
      },
      {
        dataIndex: "Cost_of_Advertising",
        title: () => renderTitle("基础广告费", "Cost_of_Advertising"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Cost_of_Advertising"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 150,
      },
      {
        dataIndex: "Cost_of_Advertising_other",
        title: () => renderTitle("基础广告费其它", "Cost_of_Advertising_other"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Cost_of_Advertising_other"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 180,
      },
      {
        dataIndex: "Deal",
        title: () => renderTitle("秒杀费", "Deal"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Deal"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 130,
      },
      {
        dataIndex: "Vine_Enrollment_Fee",
        title: () => renderTitle("Vine", "Vine_Enrollment_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Vine_Enrollment_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 120,
      },
      {
        dataIndex: "Coupon_Performance_Based_Fee",
        title: () =>
          renderTitle("(新)优惠券绩效费", "Coupon_Performance_Based_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Coupon_Performance_Based_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 200,
      },
      {
        dataIndex: "Coupon_Participation_Fee",
        title: () =>
          renderTitle("(新)优惠券参与费", "Coupon_Participation_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Coupon_Participation_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 200,
      },
      {
        dataIndex: "Coupon_Redemption_Fee",
        title: () => renderTitle("(旧)优惠券", "Coupon_Redemption_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Coupon_Redemption_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 160,
      },

      {
        title: "广告占比",
        dataIndex: "AdvertisingRate",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text} %
            </span>
          );
        },
        width: 110,
      },

      {
        dataIndex: "StorageFee",
        title: () => renderTitle("仓储费", "StorageFee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "StorageFee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 130,
      },

      {
        dataIndex: "Disposal_Fee",
        title: () => renderTitle("FBA移除订单-弃置费", "Disposal_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Disposal_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 220,
      },

      {
        dataIndex: "FBA_Transaction_fees",
        title: () => renderTitle("FBA交易费用", "FBA_Transaction_fees"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "FBA_Transaction_fees"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 170,
      },

      {
        dataIndex: "Liquidations",
        title: () => renderTitle("清货", "Liquidations"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Liquidations"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 120,
      },

      {
        dataIndex: "Order_Retrocharge",
        title: () => renderTitle("订单退款撤销", "Order_Retrocharge"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "Order_Retrocharge"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 170,
      },

      {
        dataIndex: "FBA_Inbound_Placement_Service_Fee",
        title: () =>
          renderTitle("入库配置费", "FBA_Inbound_Placement_Service_Fee"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "FBA_Inbound_Placement_Service_Fee"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 160,
      },
      {
        dataIndex: "unallocated_value_other",
        title: () =>
          renderTitle("其它计算列", "unallocated_value_other"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "unallocated_value_other"),
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        align: "right",
        width: 130,
      },
      {
        title: "回款($)",
        dataIndex: "extra_payment_collection",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: {
            textAlign: "center",
            color: "#fff",
            backgroundColor: "#3A3838",
          },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        dataIndex: "extra_purchase_price",
        title: () => renderTitle("进价(RMB)", "extra_purchase_price"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "extra_purchase_price"),
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        width: 140,
      },
      {
        dataIndex: "extra_weight",
        title: () => renderTitle("重量(g)", "extra_weight"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "extra_weight"),
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        width: 120,
      },
      {
        dataIndex: "extra_inside_express_price",
        title: () => renderTitle("国内物流(RMB)", "extra_inside_express_price"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "extra_inside_express_price"),
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        width: 170,
      },
      {
        dataIndex: "extra_shipping_price",
        title: () => renderTitle("海运报价(RMB)", "extra_shipping_price"),
        render: (text: string, record: ReprotItem) =>
          renderEditableCell(text, record, "extra_shipping_price"),
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        width: 170,
      },
      {
        dataIndex: "extra_shipping_fee",
        title: () => renderTitle("海运费(RMB)", "extra_shipping_fee"),
        render: (text: string, record: ReprotItem) => {
          return renderEditableCell(text, record, "extra_shipping_fee");
        },
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        width: 150,
      },
      {
        title: "单个成本(RMB)",
        dataIndex: "extra_single_cost_price",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 150,
      },

      {
        title: "单个成本($)",
        dataIndex: "extra_single_doller_cost_price",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 150,
      },

      {
        title: "成本(RMB)",
        dataIndex: "extra_rmb_cost",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "成本($)",
        dataIndex: "extra_doller_cost",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "毛利润($)",
        dataIndex: "extra_gross_profit",
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text}
            </span>
          );
        },
        width: 110,
      },
      {
        title: "毛利率",
        dataIndex: "extra_rate_of_gross_profit",
        width: 110,
        align: "right",
        // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
        onHeaderCell: () => ({
          style: { textAlign: "center", color: "#73726c" },
        }),
        render: (text: string) => {
          let val = D(text);
          if (val.gt(30)) {
            return (
              <span className="tabular-nums! font-medium text-green-800 whitespace-nowrap">
                {text} %
              </span>
            );
          }
          if (val.gt(0) && val.lt(30)) {
            return (
              <span className="tabular-nums! font-medium text-orange-800 whitespace-nowrap">
                {text} %
              </span>
            );
          }
          if (val.lt(0)) {
            return (
              <span className="tabular-nums! font-medium text-red-800 whitespace-nowrap">
                {text} %
              </span>
            );
          }

          return (
            <span className="tabular-nums! font-medium text-gray-800 whitespace-nowrap">
              {text} %
            </span>
          );
        },
        fixed: "end",
      },
    ].map((col) => {
      return {
        ...col,
        key: col.dataIndex,
      };
    }) as ColumnsType<ReprotItem>;
  }, [editingColumn, tempColumnData, currentRow]);

  const [checkedList, setCheckedList] = useState(DEFAULT_CHECKED_LIST);

  // console.log(`checkboxOptions---------------------------`);
  // console.log(JSON.stringify(checkboxOptions, null, "  "));
  // console.log(`checkboxOptions---------------------------`);

  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string),
  }));

  const SettingColumnsNode = (
    <div className="h-[350px] overflow-auto">
      <Checkbox.Group
        value={checkedList}
        options={CHECKBOX_OPTIONS as CheckboxOptionType[]}
        onChange={(value) => {
          setCheckedList(value as string[]);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      />
    </div>
  );

  // 配置显示列功能-------------------------

  const [reportStatisticInfo, setReportStatisticInfo] = useImmer<
    Record<string, string | number>
  >({
    // 美元对人民币汇率
    usdCnyRate: 6.9,
    // 总销售额
    totalProductSales: 0,
    // 总回款
    totalExtraPaymentCollection: 0,
    // sku数量
    totalSku: 0,
    // 平均毛利率
    avgRateGrossProfit: 0,
  });

  // ✅ 核心：用 ref 追踪最新汇率，useEffect 通过 ref 读取，永远拿到最新值
  const usdCnyRateRef = useRef<string | number>(6.9);
  useEffect(() => {
    usdCnyRateRef.current = reportStatisticInfo.usdCnyRate;
  }, [reportStatisticInfo.usdCnyRate]);

  const metricCardData = useMemo(() => {
    return {
      totalSales: parseFloat(reportStatisticInfo.totalProductSales as string),
      totalReceived: parseFloat(
        reportStatisticInfo.totalExtraPaymentCollection as string,
      ),
      exchangeRate: parseFloat(reportStatisticInfo.usdCnyRate as string),
      avgGrossMargin: parseFloat(
        reportStatisticInfo.avgRateGrossProfit as string,
      ),
      skuCount: parseInt(reportStatisticInfo.totalSku as string) || 0,
    };
  }, [reportStatisticInfo]);

  // 辅助工具：安全转 Decimal，防止空字符串或 undefined 报错
  const D = (val: string | number | undefined) => new Decimal(val || 0);

  function handleUsdCnyRateChange(val: string | number) {
    setReportStatisticInfo((draft) => {
      draft.usdCnyRate = val;
    });
  }

  // 计算某列的 scrollLeft 偏移量
  function getColumnOffset(columns: any[], targetKey: string) {
    let offset = 0;
    for (const col of columns) {
      if (col.dataIndex === targetKey) break;

      if (col.fixed !== "start") {
        offset += col.width ?? 100;
      }
    }
    return offset - 1;
  }

  function fastColumnGo(dataIndex: string) {
    const offset = getColumnOffset(columns, dataIndex);
    const tableBody =
      tableRef.current?.nativeElement?.querySelector(".ant-table-content");
    if (tableBody) {
      tableBody.scrollTo({ left: offset, behavior: "smooth" });
    }
  }

  async function handleCopyData() {
    // 考虑隐藏列情况
    const headersList: Array<Record<string, string>> = newColumns
      .filter((col) => !col.hidden)
      .map((item) => {
        let target = columnsSimpleList.find(
          (col) => col.dataIndex === item.key,
        );

        return {
          name: target?.title as string,
          key: item.key as string,
        };
      });

    // 复制头部汇总数据

    const summaryTitle = [
      ["总销售额", "总回款", "汇率", "平均毛利率"].join("\t"),
      [
        metricCardData.totalSales,
        metricCardData.totalReceived,
        metricCardData.exchangeRate,
        String(metricCardData.avgGrossMargin) + " %",
      ].join("\t"),
    ];

    // 复制表头
    const header = headersList.map((h) => h.name).join("\t");
    // 复制行数据
    const data = reportData.map((item) => {
      let rowData = headersList
        .map((h) => {
          // 这些列需要添加 百分号
          let addRateKeyList = [
            "refundRate",
            "AdvertisingRate",
            "extra_rate_of_gross_profit",
          ];
          return addRateKeyList.includes(h.key)
            ? `${item[h.key]} %`
            : item[h.key];
        })
        .join("\t");
      return rowData;
    });

    // 复制底部汇总数据
    const keyList = [
      "Cost_of_Advertising",
      "Cost_of_Advertising_other",
      "StorageFee",
      "extra_payment_collection",
      "extra_gross_profit",
    ];

    // 考虑隐藏列情况
    const currentShowColumnsList = newColumns.filter((col) => !col.hidden);

    const summaryObj = calcSummaryData(
      reportData,
      currentShowColumnsList,
      keyList,
    );

    const summary = currentShowColumnsList
      ?.map((h, idx) => {
        let cell = summaryObj[h.key as keyof ReprotItem] || "-";
        return idx === 0 ? "汇总统计" : cell.value;
      })
      .join("\t");

    const text = [...summaryTitle, "", "", header, ...data, summary].join("\n");

    const success = await copyToClipboard(text);

    if (success) {
      message.info("已复制");
    } else {
      message.error("复制失败，请手动复制");
    }
  }

  // 层级1-A：外部 data 变化，直接替换 reportData，不在这里算任何东西
  useEffect(() => {
    console.log("data 改变触发...");
    setReportData(data); // ✅ 只做数据写入，计算交给下面的 effect
  }, [data]);

  // 层级1-B：repairDataList 变化，在 immer draft 里修补数据，不在这里调 updateCalc
  useEffect(() => {
    if (repairDataList.length === 0) return;
    console.log("repairDataList 改变触发...");
    setReportData((draft) => {
      repairDataList.forEach((repairItem) => {
        const { sku, __target__, total } = repairItem;
        const targetName = __target__ as unknown as string;
        // ✅ 修复：统一用 sku 字段查找（与 getReportList 保持一致）
        const target = draft.find((item) => item.sku === sku);
        if (target) {
          (target as any)[targetName] = D((target as any)[targetName] as string)
            .add(D(total))
            .toFixed(2);
        } else {
          console.warn(`未找到 sku:${sku} 的品`);
        }
      });
      // ✅ 关键：在 immer 回调里直接跑计算管线
      // draft 此时是修补后的最新数据，rate 从 ref 读取，永远是最新值
      const rate = usdCnyRateRef.current;
      draft.forEach((item, i) => {
        Object.assign(draft[i], runCalcPipeline(item, rate));
      });
    });
    // ✅ 不需要再单独调 updateCalc()，计算已经在 immer draft 里完成
  }, [repairDataList]);

  // 层级2：reportData 变化（由层级1触发） → 跑计算管线
  // 注意：repairDataList 的 effect 已经在 draft 内部跑了管线，
  // 但 setReportData 触发的 reportData 变化会再次进入这里，
  // 用 isCalcDoneRef 做幂等保护
  useEffect(() => {
    console.log("reportData 改变触发，执行计算管线...");
    const rate = usdCnyRateRef.current; // ✅ 从 ref 读取，永远是最新值
    setReportData((draft) => {
      draft.forEach((item, i) => {
        Object.assign(draft[i], runCalcPipeline(item, rate));
      });
    });
  }, [data]);

  // 层级3：usdCnyRate 变化 → 重跑计算管线（rate 已是最新，从 ref 读）
  useEffect(() => {
    console.log("usdCnyRate 改变触发，重新计算...");
    const rate = reportStatisticInfo.usdCnyRate; // ✅ effect 内直接用，此时已是新值
    setReportData((draft) => {
      draft.forEach((item, i) => {
        Object.assign(draft[i], runCalcPipeline(item, rate));
      });
    });
  }, [reportStatisticInfo.usdCnyRate]);

  // 层级4：统计汇总 —— 统一在一个 effect 里，接收计算完成后的 reportData 快照
  // 依赖 reportData + usdCnyRate，两者任一变化都重算汇总
  useEffect(() => {
    console.log("统计汇总触发...");
    if (reportData.length === 0) return;
    const rate = usdCnyRateRef.current;
    const result = calcTotalFromSnapshot(reportData, rate); // ✅ 纯函数，无副作用
    setReportStatisticInfo((draft) => {
      draft.totalProductSales = result.totalProductSales;
      draft.totalExtraPaymentCollection = result.totalExtraPaymentCollection;
      draft.avgRateGrossProfit = result.avgRateGrossProfit;
      draft.totalSku = result.totalSku;
    });
    setCategtoryProductData(result.categoryData);
  }, [reportData, reportStatisticInfo.usdCnyRate]);
  // ✅ 同时依赖两者：reportData 计算完 或 汇率变了，都要重新汇总

  /**
   * 数据对比预警
   * 原始数据和处理后的数据对比，校验用于发现问题
   * 获取原始报表中的 总回款费、总广告费、存储和超期存储费
   */
  const shouldTriggerAlarm = useMemo(() => {
    // 源数据
    const {
      payment: source_payment,
      ads: source_ads,
      storage: source_storage,
    } = reportSourceData;

    // 计算数据
    const payment = D(reportStatisticInfo.totalExtraPaymentCollection).toFixed(
      2,
    );
    const ads = reportData
      .reduce((acc, cur) => {
        return acc
          .add(D(cur.Cost_of_Advertising as string))
          .add(D(cur.Cost_of_Advertising_other as string));
      }, D(0))
      .toFixed(2);
    const storage = reportData
      .reduce((acc, cur) => {
        return acc.add(D(cur.StorageFee as string));
      }, D(0))
      .toFixed(2);

    const msg: Array<string> = [];

    const alert_payment_threshold = 15;
    const alert_ads_threshold = 10;
    const alert_storage_threshold = 5;

    const diff_alert_payment = D(payment)
      .abs()
      .minus(D(source_payment).abs())
      .abs();
    const diff_alert_ads = D(ads).abs().minus(D(source_ads).abs()).abs();
    const diff_alert_storage = D(storage)
      .abs()
      .minus(D(source_storage).abs())
      .abs();

    const is_alert_payment = diff_alert_payment.gte(alert_payment_threshold);
    const is_alert_ads = diff_alert_ads.gte(alert_ads_threshold);
    const is_alert_storage = diff_alert_storage.gte(alert_storage_threshold);

    if (is_alert_payment) {
      msg.push(
        `【回款差额 $${alert_payment_threshold} 预警】: 原始报表数据【${D(source_payment).abs().toFixed(2)}】 系统计算【${D(payment).abs().toFixed(2)}】 差额：【${diff_alert_payment.toFixed(2)}】`,
      );
    }
    if (is_alert_ads) {
      msg.push(
        `【广告差额 $${alert_ads_threshold} 预警】: 原始报表数据【${D(source_ads).abs().toFixed(2)}】 系统计算【${D(ads).abs().toFixed(2)}】 差额：【${diff_alert_ads.toFixed(2)}】`,
      );
    }
    if (is_alert_storage) {
      msg.push(
        `【仓储差额 $${alert_storage_threshold} 预警】: 原始报表数据【${D(source_storage).abs().toFixed(2)}】 系统计算【${D(storage).abs().toFixed(2)}】 差额：【${diff_alert_storage.toFixed(2)}】`,
      );
    }

    return msg;
  }, [reportData, reportStatisticInfo, reportSourceData]);

  if (reportData.length === 0) {
    return null;
  }

  return (
    <>
      <div className=" max-w-[75%] overflow-auto mt-5">
        <MetricCards data={metricCardData} callback={handleUsdCnyRateChange} />
      </div>
      {shouldTriggerAlarm && shouldTriggerAlarm.length > 0 && (
        <div className="mt-5 flex flex-col gap-1">
          {shouldTriggerAlarm.map((msg) => {
            return <Alert key={msg} title={msg} type="error" showIcon closable />;
          })}
        </div>
      )}
      <div className=" flex justify-between items-center mt-5">
        <Tooltip title="点击快速跳转到列" color="#108ee9" placement="top">
          <div className=" inline-flex items-center gap-2 ">
            {FAST_COLUMN_KEY_LIST.map((col) => {
              return (
                <Button
                  key={col?.dataIndex}
                  type="dashed"
                  shape="round"
                  variant="dashed"
                  onClick={() => fastColumnGo(col?.dataIndex as string)}
                >
                  {col?.title}
                </Button>
              );
            })}
          </div>
        </Tooltip>

        <div className="flex items-center">
          <Popover
            content={SettingColumnsNode}
            placement="left"
            title="配置显示列名"
            trigger="click"
          >
            <Button type="link" size="small" onClick={() => {}}>
              配置显示列名
            </Button>
          </Popover>

          <Button type="link" size="small" onClick={handleCopyData}>
            复制表格数据
          </Button>
        </div>
      </div>

      <div className={cn("w-full overflow-auto mt-5", className)}>
        <Table
          scroll={{ x: "max-content" }}
          ref={tableRef}
          rowKey={(record) => record.__key}
          onRow={(record) => {
            return {
              onMouseEnter: () => {
                setCurrentRow(record);
              },
              onMouseLeave: () => {
                setCurrentRow(undefined);
              },
            };
          }}
          size="small"
          bordered
          pagination={false}
          columns={newColumns}
          dataSource={reportData}
          summary={(pageData) => {
            // 汇总统计 基础广告费、基础广告费其他、仓储费、回款、毛利润
            const keyList = [
              "Cost_of_Advertising",
              "Cost_of_Advertising_other",
              "StorageFee",
              "extra_payment_collection",
              "extra_gross_profit",
            ];

            // 考虑隐藏列情况
            const currentShowColumnsList = newColumns.filter(
              (col) => !col.hidden,
            );

            const summaryObj = calcSummaryData(
              pageData,
              currentShowColumnsList,
              keyList,
            );

            return (
              <TableSummaryRow
                columns={currentShowColumnsList}
                summaryObj={summaryObj}
                label="汇总统计"
              />
            );
          }}
        />
      </div>
      <div className="mt-5">
        <Popover
          content={
            <div className="w-[400px] h-auto max-h-[300px] overflow-auto">
              <CategoryTableList data={categtoryProductData} />
            </div>
          }
          placement="left"
          trigger="click"
        >
          <Button type="link" size="small" onClick={() => {}}>
            点击查看分类产品毛利润统计
          </Button>
        </Popover>
      </div>
    </>
  );
}

export default ReprotShow;
