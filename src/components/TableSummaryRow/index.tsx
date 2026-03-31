// components/TableSummaryRow.tsx
import { Table } from "antd";
import type { ColumnType } from "antd/es/table";

interface SummaryObj {
  [key: string]: { value: string; index: number };
}

interface TableSummaryRowProps<T> {
  columns: ColumnType<T>[];
  summaryObj: SummaryObj;
  /** 第一列的汇总标签，默认"汇总统计" */
  label?: string;
}

export function TableSummaryRow<T>({
  columns,
  summaryObj,
  label = "汇总统计",
}: TableSummaryRowProps<T>) {
  return (
    <Table.Summary fixed>
      <Table.Summary.Row>
        {columns.map((col, idx) => {
          const dataIndex = col.key as string;
          const matched = summaryObj[dataIndex];
          const cellIndex = matched?.index >= 0 ? matched.index : idx;
          const cellValue = matched?.value ?? "-";

          return (
            <Table.Summary.Cell
              key={dataIndex}
              index={cellIndex}
              align={idx === 0 ? "left" : "right"}
            >
              <span className="font-medium text-red-700 whitespace-nowrap">
                {idx === 0 ? label : cellValue}
              </span>
            </Table.Summary.Cell>
          );
        })}
      </Table.Summary.Row>
    </Table.Summary>
  );
}