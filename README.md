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







