import type { ReprotItem } from "@/types/common";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { cn } from "@/utils/classnames";
import { Button, Select, Table, Tag, Modal, Badge } from "antd";
import type { TableProps } from "antd";
import { SwapRightOutlined } from "@ant-design/icons";
import _ from "lodash";
import Decimal from "decimal.js";

interface PendingListProps {
  data: Array<ReprotItem>;
  skulist: Array<string>;
  callback: (data: Array<ReprotItem>) => void;
  className?: string;
}

const { warning } = Modal;

function PendingList({ data, skulist, className, callback }: PendingListProps) {
  const [reportData, setReportData] = useImmer<Array<ReprotItem>>([]);
  const columns: TableProps<ReprotItem>["columns"] = [
    {
      key: "__order__",
      title: "序号",
      dataIndex: "__order__",
      render: (_, __, idx) => {
        return idx + 1;
      },
      width: 60,
    },
    {
      key: "type",
      title: "type",
      dataIndex: "type",
      render: (value) => {
        return (
          <Tag variant="outlined" color="red">
            {value}
          </Tag>
        );
      },
      width: 150,
    },
    {
      key: "order id",
      title: "order id",
      dataIndex: "order id",
      width: 150,
    },
    {
      key: "sku",
      title: "sku",
      dataIndex: "sku",
      render: (_, record, idx) => {
        return (
          <div className=" w-[420px] flex items-center justify-center gap-2">
            <Select
              style={{ width: 150 }}
              placeholder="选择sku"
              disabled={record.__status === "done"}
              popupMatchSelectWidth={false}
              onChange={(val) => handleSelectChange(val, idx, "sku")}
              options={skuListSelect}
            />
            <span>
              <SwapRightOutlined />
            </span>
            <Select
              style={{ width: 200 }}
              placeholder="选择分配列"
              disabled={record.__status === "done"}
              popupMatchSelectWidth={false}
              onChange={(val) => handleSelectChange(val, idx, "__target__")}
              options={categoryListSelect}
            />
          </div>
        );
      },
      width: 400,
    },
    {
      key: "description",
      title: "description",
      dataIndex: "description",
      width: 200,
    },
    {
      key: "total",
      title: "total",
      dataIndex: "total",
      width: 100,
    },
    {
      key: "__status",
      title: "状态",
      dataIndex: "__status",
      width: 100,
      render: (_, record) => {
        if (record.__status === "pending") {
          return <Tag color="blue">待处理</Tag>;
        } else {
          return <Tag color="green">已完成</Tag>;
        }
      },
    },
    {
      key: "__action__",
      title: "操作",
      dataIndex: "__action__",
      render: (_, record) => {
        if (record.__status === "pending") {
          return (
            <Button
              size="small"
              type="dashed"
              shape="round"
              variant="dashed"
              onClick={() => handleRepairAll(record)}
            >
              处理
            </Button>
          );
        }
        return "-";
      },
      width: 60,
    },
  ];

  const [categoryListSelect] = useState([
    {
      label: "清算($)",
      value: "Adjustment",
    },
    {
      label: "基础广告费($)",
      value: "Cost_of_Advertising",
    },
    {
      label: "基础广告费其它($)",
      value: "Cost_of_Advertising_other",
    },
    {
      label: "秒杀费($)",
      value: "Deal",
    },
    {
      label: "Vine($)",
      value: "Vine_Enrollment_Fee",
    },
    {
      label: "(新)优惠券绩效费($)",
      value: "Coupon_Performance_Based_Fee",
    },
    {
      label: "(新)优惠券参与费($)",
      value: "Coupon_Participation_Fee",
    },
    {
      label: "(旧)优惠券($)",
      value: "Coupon_Redemption_Fee",
    },
    {
      label: "存储费($)",
      value: "StorageFee",
    },

    {
      label: "FBA移除订单：弃置费($)",
      value: "Disposal_Fee",
    },

    {
      label: "FBA交易费用($)",
      value: "FBA_Transaction_fees",
    },

    {
      label: "清货($)",
      value: "Liquidations",
    },

    {
      label: "订单退款撤销($)",
      value: "Order_Retrocharge",
    },

    {
      label: "入库配置费($)",
      value: "FBA_Inbound_Placement_Service_Fee",
    },

    {
      label: "其它计算列",
      value: "unallocated_value_other"
    }
  ]);

  const [skuListSelect, setSkuListSelect] = useState(
    skulist.map((sku) => {
      return {
        label: sku,
        value: sku,
      };
    }),
  );

  const isPendingList = useMemo(() => {
    return reportData.filter((item) => item.__status === "pending").length;
  }, [reportData]);

  function handleSelectChange(value: string, rowIdx: number, attrName: string) {
    setReportData((draft) => {
      draft[rowIdx][attrName] = value;
    });
  }

  function handleRepairAll(record?: ReprotItem) {
    let __pendingList = record
      ? [record]
      : reportData.filter((item) => item.__status === "pending");
    let valid = __pendingList.every((item) => {
      let case1 = item.sku && String(item.sku).length > 0;
      let case2 = item.__target__ && String(item.__target__).length > 0;
      return case1 && case2;
    });

    if (!valid) {
      warning({
        title: "提示",
        content: "数据校验不通过，存在未选择的sku和属性分配",
        okText: "知道了",
        onOk() {
          console.log("OK");
        },
      });
      return;
    }

    callback(__pendingList);
    setReportData((draft) => {
      if (record) {
        let target = draft.find((item) => item.__key === record.__key);
        if (target) {
          target.__status = "done";
        }
      } else {
        draft
          .filter((item) => item.__status === "pending")
          .forEach((item) => {
            item.__status = "done";
          });
      }
    });
  }




  const stylesFn: TableProps<ReprotItem>["styles"] = () => {
    return {
      title: {
        backgroundColor: "#f6eedf",
        color: "#5a4815",
      },
    };
  };


  /**
   * 对数据进行了预处理
   * 例如 type = Fee Adjustment， 调整有很多条 ，每个需要单独处理很麻烦，多条相同的 total 相加成一条即可
   * @param data 
   * @returns 
   */
  function preFormatData(data:Array<ReprotItem>){
    const result = _.chain(data)
    .groupBy(item => `${item['settlement id']}_${item['type']}_${item['description']}`) // 按 settlement id+type+description 分组
    .map(group => {
      const first = group[0]
      const totalValue = group.reduce(
        (acc, item) => acc.plus(item.total || 0),
        new Decimal(0)
      ).toFixed(2);
      return { ...first, total: totalValue };
    })
    .value();

    return result
  }

  useEffect(() => {
    setReportData(preFormatData(data));
  }, [data]);

  useEffect(() => {
    setSkuListSelect(
      skulist.map((sku) => {
        return {
          label: sku,
          value: sku,
        };
      }),
    );
  }, [skulist]);

  if (reportData.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table<ReprotItem>
        scroll={{ x: "max-content" }}
        styles={stylesFn}
        title={() => {
          return (
            <div className="flex items-center ">
              {isPendingList === 0 ? (
                <span>已全部处理完成</span>
              ) : (
                <>
                  <span className="mr-2">待处理数据 </span>
                  <Badge showZero count={isPendingList} />
                  <span className="ml-5">需要补充 SKU 后方可处理</span>
                </>
              )}
            </div>
          );
        }}
        rowKey={(record) => record.__key}
        size="small"
        bordered
        pagination={false}
        columns={columns}
        dataSource={reportData}
      />

      <div className=" flex items-center justify-between py-2 px-4">
        <div className=" w-1/2 m-auto">
          <Button
            type="dashed"
            block
            shape="round"
            size="large"
            disabled={
              reportData.filter((item) => item.__status === "pending")
                .length === 0
            }
            onClick={() => handleRepairAll()}
          >
            一键处理
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PendingList;
