// 从 assets 目录加载（推荐）
async function loadOrderByMock() {
  const response = await fetch("/src/mockdata/order-2025-2.csv");
  const text = await response.text();
  return text;
}

async function loadStorageByMock() {
  const response = await fetch("/src/mockdata/storage-2025-1.csv");
  const text = await response.text();
  return text;
}

export { loadOrderByMock, loadStorageByMock };
