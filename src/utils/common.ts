import MD5 from "crypto-js/MD5";
import deepseek_parse_pdf from "@/utils/request";

export function md5WithChinese(str: string) {
  let _str = str.trim().toLocaleLowerCase();
  return MD5(_str).toString();
}

/**
 * 大模型返回比较慢，这里对文件进行了缓存
 * @param file
 * @returns
 */
export async function getAdsFromCache(file: File) {
  const __key__ = "__ads_cache__";
  const __file_key__ = md5WithChinese(file.name);
  const cacheData = window.localStorage.getItem(__key__);

  let cacheAdsDataList: { [key: string]: any } = {};
  if (cacheData) {
    try {
      cacheAdsDataList = JSON.parse(cacheData);
      if (cacheAdsDataList[__file_key__]) {
        console.warn("从缓存获取广告数据");
        return cacheAdsDataList[__file_key__];
      }
      const adsData = await deepseek_parse_pdf(file);
      cacheAdsDataList[__file_key__] = adsData;
      window.localStorage.setItem(__key__, JSON.stringify(cacheAdsDataList));
      return adsData;
    } catch (err) {
      console.error(err);

      console.log("请求请求大模型");
      const adsData = await deepseek_parse_pdf(file);
      window.localStorage.setItem(
        __key__,
        JSON.stringify({
          [__file_key__]: adsData,
        }),
      );
      return adsData;
    }
  } else {
    console.warn("从大模型接口获取广告数据");
    const adsData = await deepseek_parse_pdf(file);
    window.localStorage.setItem(
      __key__,
      JSON.stringify({
        [__file_key__]: adsData,
      }),
    );
    return adsData;
  }
}

// utils/copyUtils.js
export const copyToClipboard = async (text: string) => {
  // 1. 优先使用现代 Clipboard API (需要在安全上下文)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true; // 成功
    } catch (err) {
      console.error("Clipboard API 复制失败:", err);
      // 失败时尝试降级方案
    }
  }

  // 2. 降级方案：使用传统的 execCommand (适用于 HTTP IP 地址)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // 让 textarea 不可见
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // 执行复制命令
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    } else {
      console.error("execCommand 复制失败");
      return false;
    }
  } catch (err) {
    console.error("降级复制方案失败:", err);
    return false;
  }
};

export const columnsSimpleList = [
  {
    title: "名称",
    dataIndex: "__name",
  },
  {
    title: "fnsku",
    dataIndex: "__fnsku",
  },
  {
    title: "asin",
    dataIndex: "__asin",
  },
  {
    title: "sku",
    dataIndex: "sku",
  },
  {
    title: "销量",
    dataIndex: "qty",
  },
  {
    title: "销售额($)",
    dataIndex: "productSales",
  },
  {
    title: "佣金($)",
    dataIndex: "sellingFees",
  },
  {
    title: "FBA配送费($)",
    dataIndex: "fbaFees",
  },
  {
    title: "其他($)",
    dataIndex: "others",
  },
  {
    title: "退款($)",
    dataIndex: "refund",
  },
  {
    title: "退款数量",
    dataIndex: "refundQty",
  },
  {
    title: "退货率",
    dataIndex: "refundRate",
  },
  {
    dataIndex: "Adjustment",
    title: "清算",
  },
  {
    dataIndex: "Cost_of_Advertising",
    title: "基础广告费($)",
  },
  {
    dataIndex: "Cost_of_Advertising_other",
    title: "基础广告费其它($)",
  },
  {
    dataIndex: "Deal",
    title: "秒杀费($)",
  },
  {
    dataIndex: "Vine_Enrollment_Fee",
    title: "Vine($)",
  },
  {
    dataIndex: "Coupon_Performance_Based_Fee",
    title: "(新)优惠券绩效费($)",
  },
  {
    dataIndex: "Coupon_Participation_Fee",
    title: "(新)优惠券参与费($)",
  },
  {
    dataIndex: "Coupon_Redemption_Fee",
    title: "(旧)优惠券($)",
  },
  {
    dataIndex: "StorageFee",
    title: "存储费($)",
  },

  {
    dataIndex: "Disposal_Fee",
    title: "FBA移除订单：弃置费($)",
  },

  {
    dataIndex: "FBA_Transaction_fees",
    title: "FBA交易费用($)",
  },

  {
    dataIndex: "Liquidations",
    title: "清货($)",
  },

  {
    dataIndex: "Order_Retrocharge",
    title: "订单退款撤销($)",
  },

  {
    dataIndex: "FBA_Inbound_Placement_Service_Fee",
    title: "入库配置费($)",
  },
  {
    title: "回款($)",
    dataIndex: "extra_payment_collection",
  },
  {
    dataIndex: "extra_purchase_price",
    title: "进价(RMB)",
  },
  {
    dataIndex: "extra_weight",
    title: "重量(g)",
  },
  {
    dataIndex: "extra_inside_express_price",
    title: "国内物流(RMB)",
  },
  {
    dataIndex: "extra_shipping_price",
    title: "海运报价(RMB)",
  },
  {
    dataIndex: "extra_shipping_fee",
    title: "海运费(RMB)",
  },
  {
    title: "单个成本(RMB)",
    dataIndex: "extra_single_cost_price",
  },

  {
    title: "成本(RMB)",
    dataIndex: "extra_rmb_cost",
  },
  {
    title: "成本($)",
    dataIndex: "extra_doller_cost",
  },
  {
    title: "毛利润",
    dataIndex: "extra_gross_profit",
  },
  {
    title: "毛利率",
    dataIndex: "extra_rate_of_gross_profit",
  },
];
