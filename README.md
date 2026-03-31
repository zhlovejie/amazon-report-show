1.产品字典:
productList = [
  {
    "name": "门后-单黑",
    "fnsku": "X003IDW07X",
    "asin": "B0BMF6VST8",
    "sku": "hook01"
  },
  {
    "name": "门后-孖黑",
    "fnsku": "X003TKCFCF",
    "asin": "B0C538JL1X",
    "sku": "hook02"
  },
  {
    "name": "门后-单白",
    "fnsku": "X0048XOI7H",
    "asin": "B0D4MCXCC6",
    "sku": "hook01-white"
  },
  {
    "name": "T18褐色",
    "fnsku": "X004EJ05W7",
    "asin": "B0DHL54ZV4",
    "sku": "T-tie-red01"
  },
  {
    "name": "T18黑",
    "fnsku": "X004EJ051D",
    "asin": "B0DHQ8QGQG",
    "sku": "T-tie-black01"
  },
  {
    "name": "T18褐双",
    "fnsku": "X004Q4DZLX",
    "asin": "B0FDFSKK4L",
    "sku": "T-tie-red002"
  },
  {
    "name": "双14墙挂黑",
    "fnsku": "X004DAC1AV",
    "asin": "B0DDXB7T2H",
    "sku": "tie-wall-02black"
  },
  {
    "name": "双14墙挂白",
    "fnsku": "X004DA8SY9",
    "asin": "B0DDX41KTY",
    "sku": "tie-wall-02white"
  }
]

2.读取 销售报表 order-2025-2.csv 的数据

3.读取 仓储报表 storage-2025-1.csv 的数据

4.需求

-计算销量 

首先筛选 type为Order 的列，根据产品字典 计算 quantity 列，计算方式为累加

-计算销售额
首先筛选 type为Order 的列，根据产品字典 计算 product sales 列，计算方式为累加

-佣金
首先筛选 type为Order 的列，根据产品字典 计算 selling fees 列，计算方式为累加

-FBA配送费
首先筛选 type为Order 的列，根据产品字典 计算 fba fees 列，计算方式为累加

5.其他
首先筛选 type为Order 的列，根据产品字典 计算 
product sales tax、
shipping credits、
shipping credits tax、
gift wrap credits、
giftwrap credits tax、
Regulatory Fee、
Tax On Regulatory Fee、
promotional rebates、
promotional rebates tax、
marketplace withheld tax、
other transaction fees、
other
列，计算方式为各项累加后再相加

12个月的英文缩写（标准三字母形式）如下：

Jan - 一月 (January)

Feb - 二月 (February)

Mar - 三月 (March)

Apr - 四月 (April)

May - 五月 (May) (注：本身已是三字母，通常不缩写，直接使用 May)

Jun - 六月 (June)

Jul - 七月 (July)

Aug - 八月 (August)

Sep - 九月 (September)

Oct - 十月 (October)

Nov - 十一月 (November)

Dec - 十二月 (December)


报表优化的几点：
-1、进价(RMB)、重量(g)、国内物流(RMB)，需要自动填上固定的默认值，如果有修改，再点击修改即可
-2、海运费(RMB)要计算出来，=海运报价*重量(g)/1000
-3、单个成本(RMB)要计算出来，=进价(RMB)+国内物流(RMB)+海运费(RMB)
-4、成本(RMB)改为单个成本($)，并根据汇率计算，=成本(RMB)/汇率
-5、修改汇率时，国内物流(RMB)自动清零，需要修改
-6、存储费($)改名“仓储费”，表格属性名称在“回款”之前的左侧的，都不需要加美元符号($)
-7、表头“fnsku  asin  sku 毛利润”都不需要冻结表格列，只需固定“名称”
-8、表格需要多加一列，分别统计3个产品的毛利润；
-9、表格需要多加一行，有个汇总统计，统计“基础广告费“、“仓储费”、“回款”、“毛利率”，其中“回款”的汇总统计，是通过每个sku的回款数值相加，得到的结果，和上面的“总回款”进行比较，如果相差$15以上，需要报错提示
-10、点击快速跳转到列的数值（原：广告、优惠券、进价/物流、入库配置费）修改为“基础广告费“、“仓储费”、“回款”、“毛利率”
-11、能否加下载按钮，把数据以表格的形式下载下来






