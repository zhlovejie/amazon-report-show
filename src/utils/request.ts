import type { ResultAdvertisingBillData } from "@/types/common";
/**
 * 使用 fetch 发起包含文件的 POST 请求
 * @param {string} url - 接口地址
 * @param {File} file - 要上传的文件对象（从 input[type="file"] 获取）
 * @returns {Promise<any>} - 接口返回的响应数据
 */
async function deepseek_parse_pdf(file:File) {

  try {
    const url = 'http://139.196.209.52:8000/analyze-pdf'
    // 1. 创建 FormData 对象，用于包装表单数据（包括文件）
    const formData = new FormData();
    // 2. 向 FormData 中添加文件参数，参数名 "file" 需和后端接口约定一致
    // 第一个参数：后端接收的参数名；第二个参数：文件对象；第三个参数（可选）：自定义文件名
    formData.append('file', file);

    // 3. 发起 POST 请求
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // 直接将 FormData 作为 body 传递
      // 注意：无需手动设置 Content-Type 为 multipart/form-data，浏览器会自动处理
      // 并添加正确的 boundary（分隔符），手动设置反而会导致请求失败
      headers: {
        // 可选：添加自定义请求头（如 token）
        // 'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    // 4. 处理响应
    if (!response.ok) {
      throw new Error(`请求失败：${response.status} ${response.statusText}`);
    }

    // 根据后端返回的格式选择解析方式：json() / text() / blob() 等
    const result = await response.json();
    return result as ResultAdvertisingBillData;

  } catch (error) {
    console.error('上传失败：', error);
    throw error; // 抛出错误，让调用方可以捕获
  }
}

export default deepseek_parse_pdf