import { useState } from "react";
import { message } from "antd";
import { copyToClipboard } from "@/utils/common";
import { CopyOutlined } from "@ant-design/icons";
import { cn } from "@/utils/classnames";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      message.info("已复制");
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert("复制失败，请手动复制");
    }
  };

  return (
    <span className={cn("",className)}>
      <CopyOutlined onClick={handleCopy}/>
    </span>
  );
}
