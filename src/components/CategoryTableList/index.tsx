import type { CategoryProfitRow } from "@/types/report";
import { cn } from "@/utils/classnames";
import { Button, message, Table, type TableProps } from "antd";
import { useEffect, useState } from "react";
import { copyToClipboard, calcSummaryData } from "@/utils/common";

import { TableSummaryRow } from "@/components/TableSummaryRow";

interface CategoryTableListProps {
  data: CategoryProfitRow[];
  className?: string;
}

function CategoryTableList({ className, data }: CategoryTableListProps) {
  const [reportData, setReportData] = useState<CategoryProfitRow[]>([]);
  const columns: TableProps<CategoryProfitRow>["columns"] = [
    {
      key: "order",
      title: "序号",
      dataIndex: "order",
      // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
      onHeaderCell: () => ({
        style: { textAlign: "left", color: "#73726c" },
      }),
      render: (_, __, idx) => {
        return idx + 1;
      },
      width: 60,
    },
    {
      key: "name",
      title: "产品类别",
      dataIndex: "name",
      width: 100,
      // 2. 专门对表头单元格（th）进行样式覆盖，实现居中
      onHeaderCell: () => ({
        style: { textAlign: "left", color: "#73726c" },
      }),
    },
    {
      key: "gross_profit_doller",
      title: "毛利润($)",
      dataIndex: "gross_profit_doller",
      width: 100,
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
    },
    {
      key: "gross_profit_rmb",
      title: "毛利润(RMB)",
      dataIndex: "gross_profit_rmb",
      width: 100,
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
    },
  ];

  async function handleCopyData() {
    const headerList = columns?.filter((col) => col.key !== "order");
    // 复制表头
    const header = headerList?.map((h) => h.title).join("\t");

    // 复制行数据
    const data = reportData.map((item) => {
      const rowData = headerList
        ?.map((h) => item[h.key as keyof CategoryProfitRow])
        .join("\t");
      return rowData;
    });

    // 复制汇总数据
    const summaryObj = calcSummaryData(reportData, columns ?? [], [
      "gross_profit_doller",
      "gross_profit_rmb",
    ]);

    const summary = headerList
      ?.map((h, idx) => {
        let cell = summaryObj[h.key as keyof CategoryProfitRow] || "-";
        return idx === 0 ? "汇总统计" : cell.value;
      })
      .join("\t");

    const text = [header, ...data, summary].join("\n");

    const success = await copyToClipboard(text);

    if (success) {
      message.info("已复制");
    } else {
      alert("复制失败，请手动复制");
    }
  }

  useEffect(() => {
    setReportData(data);
  }, [data]);

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between mb-3">
        <span>分类产品毛利润统计</span>
        <Button type="link" size="small" onClick={handleCopyData}>
          复制表格数据
        </Button>
      </div>
      <Table<CategoryProfitRow>
        rowKey={(record) => record.name}
        size="small"
        bordered
        pagination={false}
        columns={columns}
        dataSource={reportData}
        summary={(pageData) => {
          const summaryObj = calcSummaryData(pageData, columns, [
            "gross_profit_doller",
            "gross_profit_rmb",
          ]);

          return (
            <TableSummaryRow
              columns={columns}
              summaryObj={summaryObj}
              label="汇总统计"
            />
          );
        }}
      />
    </div>
  );
}

export default CategoryTableList;
