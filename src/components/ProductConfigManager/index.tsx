import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  type TableProps,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import {
  getDefaultProduct,
  isDefaultProduct,
  type UnrecognizedProductReference,
} from "@/config/products";
import type { ProductConfig } from "@/types/common";

interface ProductConfigManagerProps {
  open: boolean;
  products: ProductConfig[];
  unrecognizedProducts: UnrecognizedProductReference[];
  onClose: () => void;
  onChange: (products: ProductConfig[]) => void;
}

interface ProductFormValues {
  __name: string;
  __fnsku: string;
  __asin: string;
  __sku: string;
  __category: string;
  __ads?: string[];
  __coupon?: string[];
  __default_extra_purchase_price: number;
  __default_extra_weight: number;
  __default_extra_inside_express_price: number;
  __default_extra_shipping_price: number;
}

const DEFAULT_FORM_VALUES: ProductFormValues = {
  __name: "",
  __fnsku: "",
  __asin: "",
  __sku: "",
  __category: "未分类",
  __ads: [],
  __coupon: [],
  __default_extra_purchase_price: 0,
  __default_extra_weight: 0,
  __default_extra_inside_express_price: 0,
  __default_extra_shipping_price: 7,
};

function toFormValues(product: ProductConfig): ProductFormValues {
  return {
    __name: product.__name,
    __fnsku: product.__fnsku,
    __asin: product.__asin,
    __sku: product.__sku,
    __category: product.__category,
    __ads: product.__ads,
    __coupon: product.__coupon,
    __default_extra_purchase_price: Number(
      product.__default_extra_purchase_price,
    ),
    __default_extra_weight: Number(product.__default_extra_weight),
    __default_extra_inside_express_price: Number(
      product.__default_extra_inside_express_price,
    ),
    __default_extra_shipping_price: Number(
      product.__default_extra_shipping_price,
    ),
  };
}

function toProductConfig(values: ProductFormValues, order: number): ProductConfig {
  return {
    __no: order,
    __name: values.__name.trim(),
    __fnsku: values.__fnsku.trim(),
    __asin: values.__asin.trim(),
    __sku: values.__sku.trim(),
    __category: values.__category.trim(),
    __ads: values.__ads?.map((item) => item.trim()).filter(Boolean) ?? [],
    __coupon: values.__coupon?.map((item) => item.trim()).filter(Boolean) ?? [],
    __default_extra_purchase_price: String(
      values.__default_extra_purchase_price,
    ),
    __default_extra_weight: String(values.__default_extra_weight),
    __default_extra_inside_express_price: String(
      values.__default_extra_inside_express_price,
    ),
    __default_extra_shipping_price: String(
      values.__default_extra_shipping_price,
    ),
  };
}

export default function ProductConfigManager({
  open,
  products,
  unrecognizedProducts,
  onClose,
  onChange,
}: ProductConfigManagerProps) {
  const [form] = Form.useForm<ProductFormValues>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<string | null>(null);

  const unresolvedProducts = useMemo(
    () =>
      unrecognizedProducts.filter(
        (reference) =>
          !products.some(
            (product) => product[reference.field] === reference.value,
          ),
      ),
    [products, unrecognizedProducts],
  );

  const openCreateForm = (reference?: UnrecognizedProductReference) => {
    setEditingSku(null);
    form.setFieldsValue({
      ...DEFAULT_FORM_VALUES,
      ...(reference ? { [reference.field]: reference.value } : {}),
    });
    setFormOpen(true);
  };

  const openEditForm = (product: ProductConfig) => {
    setEditingSku(product.__sku);
    form.setFieldsValue(toFormValues(product));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSku(null);
    form.resetFields();
  };

  const saveForm = async () => {
    const values = await form.validateFields();
    const sku = values.__sku.trim();
    const duplicate = products.some(
      (product) => product.__sku === sku && product.__sku !== editingSku,
    );

    if (duplicate) {
      form.setFields([
        { name: "__sku", errors: ["该 SKU 已存在，请检查后重试"] },
      ]);
      return;
    }

    const editingProduct = products.find(
      (product) => product.__sku === editingSku,
    );
    const nextOrder = editingProduct
      ? editingProduct.__no
      : Math.max(0, ...products.map((product) => product.__no)) + 1;
    const nextProduct = toProductConfig(values, nextOrder);
    const nextProducts = editingProduct
      ? products.map((product) =>
          product.__sku === editingSku ? nextProduct : product,
        )
      : [...products, nextProduct];

    onChange(nextProducts);
    message.success(editingProduct ? "产品配置已更新" : "产品配置已添加");
    closeForm();
  };

  const resetDefaultProduct = (sku: string) => {
    const defaultProduct = getDefaultProduct(sku);
    if (!defaultProduct) return;

    onChange(
      products.map((product) =>
        product.__sku === sku ? defaultProduct : product,
      ),
    );
    message.success("已恢复默认配置");
  };

  const deleteProduct = (sku: string) => {
    onChange(products.filter((product) => product.__sku !== sku));
    message.success("自定义产品已删除");
  };

  const columns: TableProps<ProductConfig>["columns"] = [
    {
      title: "产品",
      dataIndex: "__name",
      width: 150,
      render: (name: string, product) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{name}</Typography.Text>
          <Space size={4} wrap>
            <Tag>{product.__category}</Tag>
            {isDefaultProduct(product.__sku) && <Tag color="blue">默认</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "__sku",
      width: 150,
      render: (value: string) => <Typography.Text copyable>{value}</Typography.Text>,
    },
    {
      title: "商品标识",
      key: "identifiers",
      width: 180,
      render: (_, product) => (
        <Space direction="vertical" size={0}>
          <Typography.Text type="secondary">FNSKU: {product.__fnsku}</Typography.Text>
          <Typography.Text type="secondary">ASIN: {product.__asin}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "默认成本",
      key: "cost",
      width: 150,
      render: (_, product) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>进价 ¥{product.__default_extra_purchase_price}</Typography.Text>
          <Typography.Text type="secondary">
            {product.__default_extra_weight}g / 海运 ¥{product.__default_extra_shipping_price}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "匹配规则",
      key: "rules",
      width: 110,
      render: (_, product) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>广告 {product.__ads.length}</Typography.Text>
          <Typography.Text type="secondary">优惠券 {product.__coupon.length}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 112,
      render: (_, product) => {
        const isDefault = isDefaultProduct(product.__sku);
        return (
          <Space size={2}>
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={`编辑 ${product.__name}`}
                onClick={() => openEditForm(product)}
              />
            </Tooltip>
            {isDefault ? (
              <Popconfirm
                title="恢复默认配置？"
                description="当前修改将被默认值覆盖。"
                okText="恢复"
                cancelText="取消"
                onConfirm={() => resetDefaultProduct(product.__sku)}
              >
                <Tooltip title="恢复默认">
                  <Button
                    type="text"
                    icon={<UndoOutlined />}
                    aria-label={`恢复 ${product.__name} 默认配置`}
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="删除自定义产品？"
                description="删除后，相关报表将再次提示未配置。"
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteProduct(product.__sku)}
              >
                <Tooltip title="删除">
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    aria-label={`删除 ${product.__name}`}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Drawer
        title="产品配置"
        open={open}
        width="min(960px, 96vw)"
        onClose={onClose}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openCreateForm()}
          >
            添加产品
          </Button>
        }
      >
        {unresolvedProducts.length > 0 && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            title={`发现 ${unresolvedProducts.length} 项未配置产品标识`}
            description={
              <Space size={[4, 8]} wrap>
                {unresolvedProducts.map((reference) => {
                  const label =
                    reference.source === "order" ? "销售 SKU" : "仓储 FNSKU";
                  return (
                    <Button
                      key={`${reference.source}:${reference.value}`}
                      size="small"
                      onClick={() => openCreateForm(reference)}
                    >
                      {label}: {reference.value}
                    </Button>
                  );
                })}
              </Space>
            }
          />
        )}

        <Table<ProductConfig>
          rowKey="__sku"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 850 }}
          dataSource={products}
          columns={columns}
        />
      </Drawer>

      <Modal
        title={editingSku ? "编辑产品" : "添加产品"}
        open={formOpen}
        width={760}
        okText="保存"
        cancelText="取消"
        onOk={saveForm}
        onCancel={closeForm}
        destroyOnHidden
      >
        <Form<ProductFormValues>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_FORM_VALUES}
          requiredMark="optional"
        >
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="__name"
              label="产品名称"
              rules={[{ required: true, whitespace: true, message: "请输入产品名称" }]}
            >
              <Input placeholder="例如：门后-单黑" />
            </Form.Item>
            <Form.Item
              name="__category"
              label="产品分类"
              rules={[{ required: true, whitespace: true, message: "请输入产品分类" }]}
            >
              <Input placeholder="例如：门后" />
            </Form.Item>
            <Form.Item
              name="__sku"
              label="SKU"
              rules={[{ required: true, whitespace: true, message: "请输入销售报表 SKU" }]}
            >
              <Input
                placeholder="销售报表中的 sku"
                disabled={Boolean(editingSku && isDefaultProduct(editingSku))}
              />
            </Form.Item>
            <Form.Item
              name="__fnsku"
              label="FNSKU"
              rules={[{ required: true, whitespace: true, message: "请输入仓储报表 FNSKU" }]}
            >
              <Input placeholder="仓储报表中的 fnsku" />
            </Form.Item>
            <Form.Item
              name="__asin"
              label="ASIN"
              rules={[{ required: true, whitespace: true, message: "请输入 ASIN" }]}
            >
              <Input placeholder="例如：B0XXXXXXXX" />
            </Form.Item>
          </div>

          <Divider titlePlacement="start" plain>默认成本</Divider>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
            <Form.Item
              name="__default_extra_purchase_price"
              label="进价 (RMB)"
              rules={[{ required: true, message: "请输入进价" }]}
            >
              <InputNumber min={0} precision={2} className="w-full" />
            </Form.Item>
            <Form.Item
              name="__default_extra_weight"
              label="重量 (g)"
              rules={[{ required: true, message: "请输入重量" }]}
            >
              <InputNumber min={0} precision={2} className="w-full" />
            </Form.Item>
            <Form.Item
              name="__default_extra_inside_express_price"
              label="国内物流 (RMB)"
              rules={[{ required: true, message: "请输入国内物流费用" }]}
            >
              <InputNumber min={0} precision={2} className="w-full" />
            </Form.Item>
            <Form.Item
              name="__default_extra_shipping_price"
              label="海运报价 (RMB/kg)"
              rules={[{ required: true, message: "请输入海运报价" }]}
            >
              <InputNumber min={0} precision={2} className="w-full" />
            </Form.Item>
          </div>

          <Divider titlePlacement="start" plain>费用匹配</Divider>
          <Form.Item name="__ads" label="广告活动名称">
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="输入名称后按 Enter，可添加多个"
              open={false}
            />
          </Form.Item>
          <Form.Item name="__coupon" label="优惠券名称">
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="输入名称后按 Enter，可添加多个"
              open={false}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
