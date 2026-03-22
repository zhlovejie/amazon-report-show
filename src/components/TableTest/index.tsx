import React, { useState } from 'react';
import { Table, Input, Space, message, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

interface Item {
  key: string;
  name: string;
  age: string;
  remark: string;
}

const initialData: Item[] = [
  { key: '1', name: '张三', age: '32', remark: '备注 1' },
  { key: '2', name: '李四', age: '42', remark: '备注 2' },
];

const ColumnEditTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<Item[]>(initialData);
  // 记录当前处于编辑状态的列名（dataIndex）
  const [editingColumn, setEditingColumn] = useState<keyof Item | null>(null);
  // 暂存该列所有行的修改：{ rowKey: newValue }
  const [tempColumnData, setTempColumnData] = useState<Record<string, string>>({});

  // 1. 开启某一列的编辑
  const startEditColumn = (field: keyof Item) => {
    const initTemp: Record<string, string> = {};
    dataSource.forEach(item => {
      initTemp[item.key] = item[field]; // 拷贝当前列数据到临时状态
    });
    setTempColumnData(initTemp);
    setEditingColumn(field);
  };

  // 2. 保存该列的修改
  const saveColumn = () => {
    if (!editingColumn) return;
    const newData = dataSource.map(item => ({
      ...item,
      [editingColumn]: tempColumnData[item.key]
    }));
    setDataSource(newData);
    setEditingColumn(null);
    message.success(`列 [${editingColumn}] 修改成功`);
  };

  // 3. 取消编辑
  const cancelEdit = () => {
    setEditingColumn(null);
    setTempColumnData({});
  };

  // 渲染列标题的通用函数
  const renderTitle = (title: string, field: keyof Item) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title}</span>
      {editingColumn === field ? (
        <Space size={4}>
          <Typography.Link onClick={saveColumn}><SaveOutlined /></Typography.Link>
          <Typography.Link onClick={cancelEdit}><CloseOutlined style={{ color: 'red' }} /></Typography.Link>
        </Space>
      ) : (
        <Typography.Link onClick={() => startEditColumn(field)}><EditOutlined /></Typography.Link>
      )}
    </div>
  );

  const columns: ColumnsType<Item> = [
    {
      title: () => renderTitle('姓名', 'name'),
      dataIndex: 'name',
      render: (text, record) => editingColumn === 'name' ? (
        <Input 
          value={tempColumnData[record.key]} 
          onChange={e => setTempColumnData({ ...tempColumnData, [record.key]: e.target.value })} 
        />
      ) : text,
    },
    {
      title: () => renderTitle('备注', 'remark'),
      dataIndex: 'remark',
      render: (text, record) => editingColumn === 'remark' ? (
        <Input 
          value={tempColumnData[record.key]} 
          onChange={e => setTempColumnData({ ...tempColumnData, [record.key]: e.target.value })} 
        />
      ) : text,
    },
  ];

  return <Table dataSource={dataSource} columns={columns} bordered pagination={false} />;
};

export default ColumnEditTable;
