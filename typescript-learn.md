# Amazon Report Show TypeScript 学习指南

> 基于 2026-07-24 的当前工作区编写，面向需要阅读、维护和继续重构本项目的前端开发者。

## 1. 难度结论

本项目的 TypeScript 综合难度为 **3.5/5：中级，局部中高级**。

它不是“类型体操”项目：没有递归条件类型、复杂函数重载、`infer` 链或模板字面量类型。真正的难点来自以下三件事叠加：

1. Amazon CSV、广告接口和 `localStorage` 都属于运行时外部数据，不能天然相信其结构。
2. 财务报表对象不是一次创建完成，而是在多个计算步骤中逐渐补齐字段。
3. Ant Design 动态表格依赖字符串字段名，容易迫使代码使用 `keyof`、泛型和类型断言。

不同维护任务的难度差异很大：

| 任务 | 难度 | 所需能力 |
| --- | ---: | --- |
| 修改文案、样式、普通组件 | 2/5 | React Props、基础类型、联合 `null` |
| 增加产品字段或简单报表列 | 3/5 | `interface`、`keyof`、React/AntD 泛型 |
| 修改 CSV 导入和人工费用分配 | 4/5 | 泛型、条件类型、动态键、运行时收窄 |
| 修改 `ReportCalc` 财务归集 | 4.5/5 | 渐进对象建模、Decimal、断言治理、业务回归 |
| 系统清理 `any` 并重构报表状态 | 4.5/5 | 类型边界设计、状态机思维、自动化测试 |

如果已经熟悉 JavaScript 和 React，建议投入 **40～60 小时，约 4～6 周**。如果 TypeScript 和 React 都是新知识，建议预留 **6～8 周**。

## 2. 当前 TypeScript 状况

当前 `src` 下有约 **30 个 `.ts/.tsx` 文件、6379 行代码**。项目使用 TypeScript 5.9，并开启了较严格的编译配置。

值得肯定的部分：

- `strict` 已开启，基础的空值和赋值错误能被编译器发现。
- 类型已按领域拆分到 `src/types`，业务模块使用 `import type` 直接引用领域类型。
- 已使用判别联合、`keyof`、工具类型、泛型组件、条件类型和 `satisfies`。
- 当前没有 `@ts-ignore`、`@ts-expect-error` 或 `@ts-nocheck`。
- `pnpm build` 和 TypeScript 编译当前可以通过。

主要债务：

- 代码中仍有约 17 行显式 `any`，主要集中在 `src/utils/calc.ts`、`src/utils/common.ts` 和动态表格处理。
- 类型断言使用较多，约 99 行包含常见的 `as ...` 写法；断言密集处通常意味着模型与运行时状态没有完全对齐。
- CSV、HTTP JSON 和部分 `localStorage` 数据仍主要依赖断言，没有完整运行时 Schema 校验。
- `ReportMap` 保存的是 `Partial<ReportItem>`，输出时直接断言为 `ReportItem`；但 `ReportItemCalculatedFields` 本身仍是可选字段，因此当前类型并不能证明计算结果完整。
- 项目尚无自动化测试，财务公式只能依赖历史文件和人工核对。
- 当前全仓 ESLint 基线为 **155 个问题（148 errors、7 warnings）**；其中很多是历史代码风格和 React Hook 规则问题，不等同于 TypeScript 编译失败。

### 2.1 当前编译配置怎么读

主要配置位于 [`tsconfig.app.json`](./tsconfig.app.json)：

| 配置 | 当前值 | 学习重点 |
| --- | --- | --- |
| `strict` | `true` | 启用严格空值、函数参数等一组核心检查 |
| `noUnusedLocals` / `noUnusedParameters` | `true` | 未使用的变量和参数会使编译失败 |
| `verbatimModuleSyntax` | `true` | 要明确区分 `import` 和 `import type` |
| `erasableSyntaxOnly` | `true` | 偏向只用可擦除语法，避免依赖 enum、namespace、参数属性等额外转换 |
| `moduleResolution` | `bundler` | 按 Vite 等现代打包器的方式解析模块 |
| `noEmit` | `true` | TypeScript 只检查类型，JavaScript 产物由 Vite 生成 |
| `skipLibCheck` | `true` | 跳过依赖声明文件检查，是构建速度与第三方兼容性的权衡 |
| `noUncheckedIndexedAccess` | 未开启 | 当前数组和字典索引的类型比真实运行时更乐观 |
| `exactOptionalPropertyTypes` | 未开启 | 当前没有严格区分属性缺失和显式 `undefined` |

构建脚本使用 `tsc -b`，因为根 [`tsconfig.json`](./tsconfig.json) 通过 project references 同时管理应用配置和 Vite 配置。

## 3. 先理解数据类型链

学习本项目最有效的方式不是从语法章节开始，而是沿着数据流阅读：

```text
销售/仓储 CSV
  -> RawOrderRow / RawStorageRow
  -> TrackedOrderRow / TrackedStorageRow
  -> ReportCalc + ReportMap
  -> ReportItem（展示模型，计算字段当前仍可选）/ PendingOrderRow

广告 PDF / HTTP JSON
  -> AdvertisingBillResponse
  -> AdvertisingBillData
  -> ReportCalc.initCalcAds()
  -> ReportMap

产品 localStorage
  -> unknown
  -> normalizeProduct()
  -> ProductConfig
  -> ReportCalc / ReportMap
```

对应源码：

| 类型领域 | 文件 | 作用 |
| --- | --- | --- |
| 原始报表 | [`src/types/report-source.ts`](./src/types/report-source.ts) | 表头常量、文件类型、原始行和跟踪行 |
| 产品 | [`src/types/product.ts`](./src/types/product.ts) | 产品身份、成本和匹配规则 |
| 广告 | [`src/types/advertising.ts`](./src/types/advertising.ts) | 广告账单和接口响应 |
| 计算报表 | [`src/types/report.ts`](./src/types/report.ts) | 计算字段、展示用报表模型、待处理行和汇总数据 |
| 工作流 | [`src/types/workflow.ts`](./src/types/workflow.ts) | 文件导入结果和计算器输入 |
| 统一出口 | [`src/types/index.ts`](./src/types/index.ts) | 区分类型导出与运行时值导出 |
| 迁移兼容 | [`src/types/common.ts`](./src/types/common.ts)、[`src/types/legacy.ts`](./src/types/legacy.ts) | 仅供旧代码迁移，新代码不应依赖 |

## 4. 必须掌握的项目内类型知识

### 4.1 `interface`、`type` 和交叉类型

先阅读 `src/types/product.ts`、`src/types/advertising.ts` 和 `src/types/report.ts`。

本项目通常使用：

- `interface` 描述可扩展的对象结构，例如 `ProductConfig`。
- `type` 表示联合、交叉或工具类型组合。
- `A & B` 表示对象必须同时满足多个类型。

```ts
export type PendingOrderRow = TrackedOrderRow & PendingRepairFields;

export type ReportItem = ProductConfig &
  ReportItemCalculatedFields &
  ReportItemMetadata;
```

需要理解：`ReportItem` 是展示层使用的 SKU 报表行，`PendingOrderRow` 是仍待人工分配的原始交易。它们虽然会在同一业务流程中出现，但不是同一种实体。当前 `ReportItemCalculatedFields` 全部可选，所以 `ReportItem` 还不是真正由类型保证的“计算完成态”。

### 4.2 字面量联合和判别联合

[`src/types/workflow.ts`](./src/types/workflow.ts) 的 `FileImportResult` 是最适合入门的例子：

```ts
type FileImportResult =
  | {
      status: "ok";
      orderData: RawOrderRow[];
      storageData: RawStorageRow[];
      adsData?: AdvertisingBillData;
      message?: string;
    }
  | { status: "error"; message: string };
```

在 `src/App.tsx` 中，检查 `status` 后，TypeScript 会自动收窄分支：

```ts
if (params.status === "error") {
  console.error(params.message);
  return;
}

// 这里 params 已经是 status: "ok" 分支
params.orderData;
```

另一个范例是 `src/components/RgaAmazonChat/index.tsx` 中的 `StreamEvent`。代码通过 `ev.type` 区分文本、来源文档和错误事件。

### 4.3 `keyof` 与安全的动态字段

动态表格必须使用运行时字段名，但字段名不应该是任意 `string`。

```ts
export interface PendingRepairFields {
  __target__?: keyof ReportItemCalculatedFields;
}

type EditableReportField = keyof ReportItemCalculatedFields;
```

这表达了“人工分配目标和可编辑列应该来自真实计算字段”的类型意图。但当前 `PendingList` 的选项值仍被推导为普通 `string`，写入时又通过断言绕过约束，因此拼错选项值仍可能通过编译。重点阅读：

- `src/types/report.ts:43`
- `src/components/PendingList/index.tsx:228`
- `src/components/ReportShow/index.tsx:50`

### 4.4 工具类型

项目中常用以下内置工具类型：

| 工具类型 | 当前示例 | 用途 |
| --- | --- | --- |
| `Partial<T>` | `ReportMap`、产品配置归一化 | 暂时允许对象只包含部分字段 |
| `Pick<T, K>` | `findUnrecognizedProducts`、聊天历史 | 只保留需要的属性 |
| `Record<K, V>` | 报表字典、聊天来源、汇总状态 | 表示键和值的映射 |
| `Exclude<T, U>` | `CsvReportFileType` | 从联合类型排除成员 |
| `keyof T` | 编辑列、汇总列、动态赋值 | 得到对象键的联合类型 |

不要把 `Partial` 当成消除错误的快捷方式。它会把所有字段变为可选，并把 `undefined` 压力传递给整个下游。

### 4.5 `as const`、`typeof` 与 `satisfies`

[`src/types/report-source.ts`](./src/types/report-source.ts) 从运行时常量推导类型：

```ts
export const REPORT_FILE_TYPES = ["order", "storage", "ads"] as const;

export type ReportFileType = (typeof REPORT_FILE_TYPES)[number];

export const NUMERIC_COLUMNS_BY_REPORT = {
  order: ["quantity", "product sales"],
  storage: ["estimated_monthly_storage_fee"],
} as const satisfies Record<CsvReportFileType, readonly string[]>;
```

- `as const` 保留 `"order"` 等字面量，而不是扩大为普通 `string`。
- `typeof` 在类型位置读取变量的静态类型。
- `[number]` 从只读数组类型中取得所有元素的联合。
- `satisfies` 检查配置是否完整，同时保留对象最精确的推导结果。

这是项目中最值得反复理解的一组写法。

### 4.6 泛型约束和映射类型

原始 CSV 行类型不是逐字段手写，而是从表头配置生成：

```ts
type ValueOfProperty<
  T extends Record<string, Record<string, unknown>>,
  P extends string,
> = {
  [K in keyof T]: T[K][P];
}[keyof T];

type CsvStringRow<K extends string> = {
  [P in K]: string;
};
```

这一段包含：

- 泛型参数 `T`、`P`、`K`
- `extends` 泛型约束
- 映射类型 `[P in K]`
- 索引访问类型 `T[K][P]`

最终效果是：修改表头常量后，`RawOrderRow` 和 `RawStorageRow` 会自动获得相应字段。

### 4.7 条件类型与泛型函数

文件解析函数让输入类型和返回类型保持关联：

```ts
type ParsedCsvRow<T extends CsvReportFileType> = T extends "order"
  ? RawOrderRow
  : RawStorageRow;

function parseCsvWithDynamicHeader<T extends CsvReportFileType>(
  file: File | string,
  type: T,
): Promise<Array<ParsedCsvRow<T>>> {
  // ...
}
```

当 `type` 是 `"order"` 时，返回 `RawOrderRow[]`；当它是 `"storage"` 时，返回 `RawStorageRow[]`。这是本项目类型难度最高的部分之一。

### 4.8 React 和第三方组件泛型

React 状态和事件需要准确类型：

```ts
const [selectedOrderFile, setSelectedOrderFile] = useState<File | null>(null);
const fileInputOrderRef = useRef<HTMLInputElement>(null);

function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  // ...
}
```

Ant Design 表格使用数据行泛型：

```ts
const columns: TableProps<ProductConfig>["columns"] = [];
const reportColumns: ColumnsType<ReportItem> = [];
```

重点不是记住库内部所有类型，而是优先复用库公开的 `TableProps<T>`、`ColumnsType<T>`、`ColumnType<T>`，不要自己造一个宽泛的 `any[]`。

### 4.9 `import type` 和类型擦除

`tsconfig.app.json` 开启了 `verbatimModuleSyntax` 和 `erasableSyntaxOnly`。纯类型依赖应写成：

```ts
import type { ProductConfig } from "@/types/product";
```

运行时需要使用的常量才使用普通导入：

```ts
import { NUMERIC_COLUMNS_BY_REPORT } from "@/types/report-source";
```

新代码应直接从领域文件导入，不应继续从 `@/types/common` 或 `@/types/legacy` 引用。

## 5. 推荐学习顺序

不要一开始就阅读 1000 行的 `src/utils/calc.ts`。按以下顺序推进会更容易建立完整模型。

### 阶段 1：编译器与简单领域类型，3～4 小时

阅读：

1. [`tsconfig.app.json`](./tsconfig.app.json)
2. [`src/types/product.ts`](./src/types/product.ts)
3. [`src/types/advertising.ts`](./src/types/advertising.ts)
4. [`src/types/index.ts`](./src/types/index.ts)
5. [`src/App.tsx`](./src/App.tsx)

掌握：

- 类型推导、对象接口、可选属性、数组和 `null`
- `strict`、`noUnusedLocals`、`noUnusedParameters`
- 路径别名和 `import type`
- `useState<T>`、`useRef<T>`、组件 Props 和回调

练习：

- 找出 `ProductConfig`、`ReportItem`、`FileImportResult` 的规范导入路径。
- 给一个 `useState` 故意传入错误初始值，阅读完整编译错误链。
- 解释类型为什么只存在于编译阶段，不能在浏览器中直接读取。

验收：能够独立定义一个有必填、可选和联合字段的 Props，并正确处理 `null`。

### 阶段 2：联合、交叉和工具类型，4～6 小时

阅读：

1. [`src/types/workflow.ts`](./src/types/workflow.ts)
2. [`src/types/report.ts`](./src/types/report.ts)
3. `src/config/products.ts:159-225`
4. `src/components/RgaAmazonChat/index.tsx:16-47`

练习：

- 写一个 `handleImportResult(result: FileImportResult)`，不使用断言访问成功和失败分支。
- 画出 `ReportItem` 的三个组成部分。
- 找出项目中的 `Partial`、`Pick`、`Record` 和 `keyof`，解释每处为什么使用。
- 给联合类型增加一个新成员，并用 `never` 写穷尽检查。

验收：能够说明“原始数据、处理中的数据、最终结果”为什么应该使用不同类型。

### 阶段 3：从常量推导类型，6～8 小时

阅读：

1. `src/types/report-source.ts:269-326`
2. `src/components/loadFileCsv/index.tsx:32-34`
3. `src/components/loadFileCsv/index.tsx:117-195`

练习应在单独分支进行：

- 给 `REPORT_FILE_TYPES` 临时增加 `"returns"`，观察 `satisfies` 如何提示缺少配置。
- 给 `ORDER_HEADER_KEYS` 临时增加字段，验证 `RawOrderRow` 自动变化。
- 分别移除 `as const` 和 `satisfies`，在编辑器中观察推导结果。
- 独立实现一个从 `{ key: string }` 配置中提取所有 `key` 值的泛型类型。

验收：能够不看答案解释 `ParsedCsvRow<T>` 为什么随参数返回不同数组类型。

### 阶段 4：外部数据边界，6～8 小时

阅读：

1. `src/components/loadFileCsv/index.tsx:117-267`
2. `src/config/products.ts:159-225`
3. [`src/utils/request.ts`](./src/utils/request.ts)
4. `src/components/RgaAmazonChat/index.tsx:459-508`

掌握：

- `unknown` 与 `any` 的区别
- `typeof`、`Array.isArray`、`instanceof` 和 `in`
- 用户定义类型谓词，如 `product is ProductConfig`
- 类型断言不是运行时验证
- CSV、JSON、`localStorage` 数据进入系统前应经过校验

练习：

- 为 `normalizeProduct` 设计 `null`、数组、缺少 SKU、字段类型错误等异常输入。
- 让广告接口先返回 `unknown`，再通过类型守卫得到 `AdvertisingBillResponse`。
- 导入一个缺列 CSV，记录当前校验能发现什么、遗漏什么。

验收：能够逐项指出哪些外部数据经过了验证，哪些只是通过 `as` 被编译器接受。

### 阶段 5：React、Immer 与 Ant Design 类型，6～8 小时

阅读：

1. [`src/App.tsx`](./src/App.tsx)
2. [`src/components/ProductConfigManager/index.tsx`](./src/components/ProductConfigManager/index.tsx)
3. [`src/components/PendingList/index.tsx`](./src/components/PendingList/index.tsx)
4. `src/components/ReportShow/index.tsx:43-201`
5. [`src/components/TableSummaryRow/index.tsx`](./src/components/TableSummaryRow/index.tsx)

练习：

- 给文件 input 的 `name` 建立字面量联合，避免任意字符串进入分支。
- 用 `satisfies` 约束人工分配选项的 `value` 必须属于 `keyof ReportItemCalculatedFields`。
- 故意给 AntD 表格写一个不存在的 `dataIndex`，检查当前类型能否阻止。
- 为一个通用表格汇总函数设计 `T` 和求和键 `K extends keyof T`。

验收：新增一列时，字段、表格、编辑状态、汇总和回调都能获得编译器提示。

### 阶段 6：财务计算类型，10～14 小时

阅读顺序：

1. [`src/components/ReportShow/calc.ts`](./src/components/ReportShow/calc.ts)
2. `src/utils/calc.ts:31-265`
3. `src/utils/calc.ts:264-474`
4. `src/utils/calc.ts:474-840`
5. `src/utils/calc.ts:840-996`

掌握：

- `RawOrderRow -> TrackedOrderRow -> ReportItem` 的生命周期
- `ReportMap = Record<string, Partial<ReportItem>>` 的利弊，以及 `ReportItem` 自身计算字段仍可选的现状
- 纯函数计算流水线与可变 class 聚合的差异
- Decimal 输入输出与字符串金额约定
- 动态键访问为什么容易产生 `as any`
- 静态类型不能替代财务公式回归测试

练习：

- 消除退款计算中的 `qty as any`，正确处理未初始化字段。
- 给 `getSourceData` 显式添加 `ReportSourceData` 返回类型。
- 选择一个 `init*` 方法消除 `reportSku as any`，并用历史报表回归。
- 设计 `ReportDraft` 和 `CompletedReportItem`，分别表达计算中和计算完成状态，先不全量改造。
- 手算一个 SKU，核对回款、成本、汇率、毛利和毛利率。

验收：修改计算逻辑时，不通过新增 `any` 或连续断言来消除错误，并能给出金额回归证据。

### 阶段 7：安全重构，8～12 小时

优先顺序：

1. `src/utils/common.ts` 的缓存 `any` 和宽泛求和泛型
2. `src/components/ReportShow/index.tsx:895` 的 `columns: any[]`
3. `src/components/ReportShow/index.tsx:1013-1019` 的动态字段写入
4. `src/utils/calc.ts` 中的 `reportSku as any`
5. CSV、广告接口和聊天流事件的运行时校验
6. `src/types/legacy.ts` 中确认无引用的迁移别名

验收：每次只收紧一个边界，同时保证类型检查、构建和业务样例结果不变。

## 6. 好示例与反例

### 建议学习的写法

- `FileImportResult`、`StreamEvent`：判别联合和自动收窄。
- `normalizeProduct(value: unknown)`：从 `unknown` 开始逐步检查。
- `REPORT_FILE_TYPES` 与 `NUMERIC_COLUMNS_BY_REPORT`：`as const` 和 `satisfies`。
- `RawOrderRow`：通过映射类型从单一配置源生成字段。
- `TableSummaryRow<T>`：泛型组件复用第三方库的 `ColumnType<T>`。
- `import type`：清楚区分编译期类型和运行时值。

### 不要直接照抄的写法

```ts
const result = await response.json();
return result as AdvertisingBillResponse;
```

这里只是告诉编译器“相信我”，服务端返回错误结构时仍会在运行时失败。

```ts
const reportSku = report[sku] as any;
```

这会让后续所有属性读写失去检查。更好的方向是为构建阶段设计明确类型，或用窄范围辅助函数完成字段更新。

```ts
const ev = JSON.parse(raw) as StreamEvent;
```

`JSON.parse` 的结果来自外部，应先作为 `unknown` 验证 `type` 和对应字段。

```ts
type ReportMap = Record<string, Partial<ReportItem>>;
```

这在渐进构建对象时方便，但会使所有字段长期保持可选。最终输出前应有一个能够证明数据完整的收口步骤。

## 7. 项目特有的类型陷阱

### 7.1 类型安全不等于输入安全

`RawOrderRow` 声明了完整 CSV 字段，但当前解析器只验证少数关键表头，最后使用类型断言返回数据。真实文件缺列时，编译器不会知道。

建议原则：

```text
外部输入 -> unknown/原始结构 -> 运行时校验 -> 领域类型
```

### 7.2 金额使用字符串是有意约定

报表金额大多以 `string` 保存，再交给 Decimal.js 运算。这能避免 JavaScript 浮点数直接参与财务计算，但也导致大量 `as string`。

不要为了“类型看起来简单”直接把金额全部改成 `number`。更好的长期方向是引入明确的金额输入类型和统一的 `D(value)` 转换边界。

### 7.3 动态列名必须来自受控联合

表格列、人工费用分配和复制功能都通过字段名访问对象。任意 `string` 会让拼写错误只能在运行时出现，应优先使用：

```ts
keyof ReportItemCalculatedFields
```

### 7.4 `Partial` 会传播不确定性

只要上游是 `Partial<ReportItem>`，产品身份和元数据也会变为可选；即使去掉外层 `Partial`，当前 `ReportItemCalculatedFields` 仍然全部可选。不要用 `as string` 逐个压掉错误，应思考何时能把“草稿”校验并转换成 `Required<ReportItemCalculatedFields>` 所表达的真正完成对象。

### 7.5 `build2` 不执行 TypeScript 检查

`package.json` 中：

```json
"build": "tsc -b && vite build",
"build2": "vite build"
```

日常验证应使用 `pnpm build`。`build2` 可能在存在类型错误时仍生成产物。

### 7.6 `strict` 仍不是最严格配置

项目尚未开启 `noUncheckedIndexedAccess` 和 `exactOptionalPropertyTypes`。因此：

- 字典或数组按索引访问时，类型可能比运行时更乐观。
- 可选属性的“缺失”和显式 `undefined` 没有被严格区分。

不要一次性开启这些选项。应先减少 `any`、断言和宽泛索引，再分阶段开启并处理错误。

### 7.7 `Record<string, T>` 不代表键一定存在

JavaScript 对象查询任意键时可能得到 `undefined`，但 `Record<string, T>` 默认告诉编译器“每一个字符串键都存在”。对于稀疏字典，更准确的候选通常是：

```ts
Partial<Record<string, T>>
Map<string, T>
```

或者开启 `noUncheckedIndexedAccess`，让索引结果显式包含 `undefined`。选择哪种方式取决于业务是否真的保证键存在。

### 7.8 类型断言不是转换

必须区分下面三种行为：

```ts
String(value);                // 运行时转换
typeof value === "string";   // 运行时检查和类型收窄
value as string;              // 仅改变编译器视角，运行时什么都不做
```

项目中 `as string` 很多，其中部分是冗余的。例如 `ReportShow/calc.ts` 的 `D` 已经接受 `undefined`，继续断言并不会补齐缺失值。

## 8. 推荐练习任务

### 练习 1：收紧广告缓存类型

位置：`src/utils/common.ts`。

目标：把 `{ [key: string]: any }` 改为基于 `AdvertisingBillResponse` 的 `Record`，并保证损坏缓存仍能回退请求。

验收：无新增断言，TypeScript 和广告缓存流程通过。

### 练习 2：给聊天流事件加运行时守卫

位置：`src/components/RgaAmazonChat/index.tsx`。

目标：让 `JSON.parse` 结果先成为 `unknown`，实现 `isStreamEvent` 后再进入分支。

验收：缺少 `delta`、错误 `type`、非对象 JSON 都不会破坏对话状态。

### 练习 3：约束人工分配选项

位置：`src/components/PendingList/index.tsx`。

目标：使用 `satisfies` 保证所有选项值都是 `keyof ReportItemCalculatedFields`。

验收：故意写错一个字段名时编译失败。

### 练习 4：消除一个计算方法中的 `any`

位置：`src/utils/calc.ts` 中任选一个 `init*` 方法。

目标：为报表草稿或字段更新辅助函数建模，不扩大其他类型。

验收：历史样例中该费用列、总回款和毛利润保持一致。

### 练习 5：设计完整报表状态

只做设计稿或小范围试验：

```ts
type ReportDraft = ProductConfig & Partial<ReportItemCalculatedFields>;
type CompletedReportItem = ProductConfig &
  Required<ReportItemCalculatedFields> &
  ReportItemMetadata;
```

目标：明确在哪个函数中完成从草稿到完整报表的校验，而不是在任意位置 `as ReportItem`。

### 练习 6：为纯计算建立测试

优先对象：`src/components/ReportShow/calc.ts`。

至少覆盖：

- 销量为 0 时毛利率为 0
- 汇率改变后美元成本重算
- 退款、广告、仓储费进入回款
- 分类毛利润汇总
- 空报表不会除以 0

项目当前没有测试框架，落地此练习前应先确定 Vitest 等最小测试方案。

## 9. 每次练习的验证流程

先创建单独分支，避免把教学试验和业务修改混在一起。

```powershell
# 仅做 TypeScript 检查
pnpm exec tsc -p tsconfig.app.json --noEmit --incremental false

# 完整生产构建，包含 TypeScript project references
pnpm build

# 检查本次修改文件；全仓目前有既有 lint 债务
pnpm exec eslint <本次修改的文件>
```

涉及财务逻辑时，还必须使用一组历史销售 CSV、仓储 CSV 和广告 PDF，核对：

- 总销售额
- 总回款
- 广告费
- 仓储费
- 待处理金额
- 单个成本和总成本
- 毛利润和毛利率
- 分类利润汇总

类型通过只能证明代码满足静态约束，不能证明财务公式正确。

## 10. 自测清单

完成学习后，应能回答以下问题：

- [ ] 为什么 `type` 和 `interface` 在本项目中承担不同职责？
- [ ] 为什么 `FileImportResult` 检查 `status` 后不需要断言？
- [ ] `as const` 和 `satisfies` 分别解决什么问题？
- [ ] `RawOrderRow` 如何从 `ORDER_HEADER_KEYS` 自动推导？
- [ ] `ParsedCsvRow<T>` 为什么属于条件类型？
- [ ] `keyof ReportItemCalculatedFields` 如何保护动态字段名？
- [ ] 为什么 `JSON.parse(...) as SomeType` 不等于校验？
- [ ] `ReportMap` 为什么使用 `Partial`，它又带来什么代价？
- [ ] Ant Design 表格为什么需要 `TableProps<Row>["columns"]`？
- [ ] 为什么财务金额不能随意改成 JavaScript `number` 运算？
- [ ] 修改一个 `init*` 方法后，如何同时证明类型和金额正确？

达到以上目标后，才适合独立修改 `src/utils/calc.ts` 和 `src/components/ReportShow/index.tsx` 这两个核心模块。
