/// <reference types="vite/client" />

declare module "react-syntax-highlighter" {
  import type { ComponentType, ReactNode } from "react";

  export interface SyntaxHighlighterProps {
    children?: ReactNode;
    customStyle?: React.CSSProperties;
    language?: string;
    showLineNumbers?: boolean;
    style?: Record<string, unknown>;
    wrapLongLines?: boolean;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const oneLight: Record<string, unknown>;
}
