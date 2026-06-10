import { useEffect } from 'react';
import { Modal } from 'antd';

const PageBackGuard = () => {
  useEffect(() => {
    let canBack = false;
    // 拦截历史后退
    history.pushState(null, '', location.href);

    const handlePop = () => {
      if (canBack) {
        history.back();
        return;
      }

      Modal.confirm({
        title: '操作提示',
        content: '确定要返回上一页吗？未保存内容将会丢失',
        okText: '确定返回',
        cancelText: '取消',
        onOk() {
          canBack = true;
          history.back();
        },
        onCancel() {
          // 取消则重新压历史，停留在当前页
          history.pushState(null, '', location.href);
        },
      });
    };

    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, []);

  return null;
};

export default PageBackGuard;