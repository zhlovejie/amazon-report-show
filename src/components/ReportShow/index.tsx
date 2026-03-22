import type { ReprotItem } from "@/types/common";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/classnames";
// import Button from "@/components/Button";
import {
  Input,
  Table,
  Space,
  Typography,
  message,
  Tooltip,
  Button,
  Checkbox,
  type CheckboxOptionType,
  Popover,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import MetricCards from "../MetricCards";
import { CopyButton } from "../CopyButton";
import { useImmer } from "use-immer";
import Decimal from "decimal.js";

import {columnsSimpleList } from "@/utils/common"
interface ReprotShowProps {
  data: Array<ReprotItem>;
  repairDataList: Array<ReprotItem>;
  className?: string;
}

function ReprotShow({ data, className, repairDataList }: ReprotShowProps) {
  const tableRef = useRef(null);
  const [reportData, setReportData] = useImmer<Array<ReprotItem>>([]);
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
    setReportData((draft) => {
      draft.forEach((item) => {
        item[editingColumn] = tempColumnData[item.__key];
      });
    });
    setEditingColumn(null);
    message.success(`列 [${editingColumn}] 修改成功`);
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

  const columns: ColumnsType<ReprotItem> = [
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
      render: (text: string, record) => {
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
      title: "销售额($)",
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
      title: "佣金($)",
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
      title: "FBA配送费($)",
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
      title: "其他($)",
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
      title: "退款($)",
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
      render: (text, record) => renderEditableCell(text, record, "Adjustment"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 110,
    },
    {
      dataIndex: "Cost_of_Advertising",
      title: () => renderTitle("基础广告费($)", "Cost_of_Advertising"),
      render: (text, record) =>
        renderEditableCell(text, record, "Cost_of_Advertising"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 150,
    },
    {
      dataIndex: "Cost_of_Advertising_other",
      title: () =>
        renderTitle("基础广告费其它($)", "Cost_of_Advertising_other"),
      render: (text, record) =>
        renderEditableCell(text, record, "Cost_of_Advertising_other"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 180,
    },
    {
      dataIndex: "Deal",
      title: () => renderTitle("秒杀费($)", "Deal"),
      render: (text, record) => renderEditableCell(text, record, "Deal"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 130,
    },
    {
      dataIndex: "Vine_Enrollment_Fee",
      title: () => renderTitle("Vine($)", "Vine_Enrollment_Fee"),
      render: (text, record) =>
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
        renderTitle("(新)优惠券绩效费($)", "Coupon_Performance_Based_Fee"),
      render: (text, record) =>
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
        renderTitle("(新)优惠券参与费($)", "Coupon_Participation_Fee"),
      render: (text, record) =>
        renderEditableCell(text, record, "Coupon_Participation_Fee"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 200,
    },
    {
      dataIndex: "Coupon_Redemption_Fee",
      title: () => renderTitle("(旧)优惠券($)", "Coupon_Redemption_Fee"),
      render: (text, record) =>
        renderEditableCell(text, record, "Coupon_Redemption_Fee"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 160,
    },
    {
      dataIndex: "StorageFee",
      title: () => renderTitle("存储费($)", "StorageFee"),
      render: (text, record) => renderEditableCell(text, record, "StorageFee"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 130,
    },

    {
      dataIndex: "Disposal_Fee",
      title: () => renderTitle("FBA移除订单：弃置费($)", "Disposal_Fee"),
      render: (text, record) =>
        renderEditableCell(text, record, "Disposal_Fee"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 220,
    },

    {
      dataIndex: "FBA_Transaction_fees",
      title: () => renderTitle("FBA交易费用($)", "FBA_Transaction_fees"),
      render: (text, record) =>
        renderEditableCell(text, record, "FBA_Transaction_fees"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 170,
    },

    {
      dataIndex: "Liquidations",
      title: () => renderTitle("清货($)", "Liquidations"),
      render: (text, record) =>
        renderEditableCell(text, record, "Liquidations"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 120,
    },

    {
      dataIndex: "Order_Retrocharge",
      title: () => renderTitle("订单退款撤销($)", "Order_Retrocharge"),
      render: (text, record) =>
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
        renderTitle("入库配置费($)", "FBA_Inbound_Placement_Service_Fee"),
      render: (text, record) =>
        renderEditableCell(text, record, "FBA_Inbound_Placement_Service_Fee"),
      onHeaderCell: () => ({
        style: { textAlign: "center", color: "#73726c" },
      }),
      align: "right",
      width: 160,
    },
    {
      title: "回款($)",
      dataIndex: "extra_payment_collection",
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
      dataIndex: "extra_purchase_price",
      title: () => renderTitle("进价(RMB)", "extra_purchase_price"),
      render: (text, record) =>
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
      render: (text, record) =>
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
      render: (text, record) =>
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
      render: (text, record) =>
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
      render: (text, record) =>
        renderEditableCell(text, record, "extra_shipping_fee"),
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
      title: "毛利润",
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
        if (val.gt(5)) {
          return (
            <span className="tabular-nums! font-medium text-red-800 whitespace-nowrap">
              {text} %
            </span>
          );
        }
        if (val.lte(5) && val.gte(0)) {
          return (
            <span className="tabular-nums! font-medium text-orange-800 whitespace-nowrap">
              {text} %
            </span>
          );
        }
        if (val.lt(0)) {
          return (
            <span className="tabular-nums! font-medium text-green-800 whitespace-nowrap">
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
  ].map(col => {
    return {
      ...col,
      key:col.dataIndex
    }
  });


  // 配置显示列功能-------------------------
  const defaultCheckedList = columnsSimpleList.map((item) => item.dataIndex);
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const checkboxOptions = columnsSimpleList.map(({ dataIndex, title }) => ({
    label: title,
    value: dataIndex,
  }));

  console.log(`checkboxOptions---------------------------`)
  console.log(JSON.stringify(checkboxOptions,null,'  '))
  console.log(`checkboxOptions---------------------------`)

  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string),
  }));

  const SettingColumnsNode = (
    <div className="h-[350px] overflow-auto">
      <Checkbox.Group
        value={checkedList}
        options={checkboxOptions as CheckboxOptionType[]}
        onChange={(value) => {
          setCheckedList(value as string[]);
        }}
        style={{
          display:'flex',
          flexDirection:'column'
        }}
      />
    </div>
  )

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
        .toFixed(2),
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
        .toFixed(2),
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
        .toFixed(2),
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
        .toFixed(2),
    };
  }

  /**
   * 计算总成本美元
   */
  function calc_extra_doller_cost(item: ReprotItem): ReprotItem {
    return {
      ...item,
      extra_doller_cost: D(item.extra_rmb_cost as string)
        .div(D(reportStatisticInfo.usdCnyRate))
        .toFixed(2),
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
        .toFixed(2),
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
        .toFixed(2),
    };
  }

  /**
   * 计算 总销售额、总回款
   */
  function calc_total() {
    let n1 = D(0),
      n2 = D(0),
      n3 = D(0);

    reportData.forEach((item) => {
      n1 = n1.add(D(item.productSales as string));
      n2 = n2.add(D(item.extra_payment_collection as string));
      n3 = n3.add(D(item.extra_rate_of_gross_profit as string));
    });

    let n4 = n3.div(reportData.length);

    setReportStatisticInfo((draft) => {
      draft.totalProductSales = n1.toFixed(2);
      draft.totalExtraPaymentCollection = n2.toFixed(2);
      draft.avgRateGrossProfit = n4.toFixed(2);
      draft.totalSku = reportData.length;
    });

    console.log(`setTotalProductSales:${n1.toFixed(2)}`);
    console.log(`setTotalExtraPaymentCollection:${n2.toFixed(2)}`);
  }

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

  useEffect(() => {
    console.log(`data 改变触发...`);
    setReportData(data);
    updateCalc();
  }, [data]);

  useEffect(() => {
    console.log(`usdCnyRate 改变触发...`);
    updateCalc();
  }, [reportStatisticInfo.usdCnyRate]);

  useEffect(() => {
    console.log(`reportData 改变触发...`);
    calc_total();
  }, [reportData]);

  useEffect(() => {
    if (repairDataList.length > 0) {
      console.log(`repairDataList 改变触发...`);
      setReportData((draft) => {
        repairDataList.forEach((repairItem) => {
          const { sku, __target__, total } = repairItem;
          let targetName: string = __target__ as unknown as string;
          let target = draft.find((item) => item.__sku === sku);
          if (target) {
            target[targetName] = D(target[targetName] as string)
              .add(D(total))
              .toFixed(2);
          } else {
            console.warn(`未找到 sku:${sku} 的品`);
          }
        });
      });

      updateCalc();
    }
  }, [repairDataList]);

  if (reportData.length === 0) {
    return null;
  }

  return (
    <>
      <div className=" max-w-[75%] overflow-auto mt-5">
        <MetricCards data={metricCardData} callback={handleUsdCnyRateChange} />
      </div>
      <div className=" flex justify-between items-center mt-5">

        <Tooltip title="点击快速跳转到列" color="#108ee9" placement="top">
          <div className=" inline-flex items-center gap-2 ">
            <Button
              type="dashed"
              shape="round"
              variant="dashed"
              onClick={() => fastColumnGo("Cost_of_Advertising")}
            >
              广告
            </Button>
            <Button
              type="dashed"
              shape="round"
              variant="dashed"
              onClick={() => fastColumnGo("Coupon_Performance_Based_Fee")}
            >
              优惠券
            </Button>
            <Button
              type="dashed"
              shape="round"
              variant="dashed"
              onClick={() => fastColumnGo("extra_purchase_price")}
            >
              进价/物流
            </Button>
            <Button
              type="dashed"
              shape="round"
              variant="dashed"
              onClick={() => fastColumnGo("FBA_Inbound_Placement_Service_Fee")}
            >
              入库配置费
            </Button>
          </div>
        </Tooltip>

        <Popover content={SettingColumnsNode} placement="left" title="配置显示列名" trigger="click">
      
            <Button
                type="link"
                size="small"
                onClick={() => {}}
              >
                配置显示列名
              </Button>
        </Popover>
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
        />
      </div>
    </>
  );
}

export default ReprotShow;
