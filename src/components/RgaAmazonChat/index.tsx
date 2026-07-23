import { useState, useRef, useEffect, useCallback } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  UIEvent,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// ─── 配置 ────────────────────────────────────────────────────────────
const BASE_URL = "http://139.196.209.52:8008";
const AUTO_SCROLL_THRESHOLD = 48;

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  _key?: string;
}

interface SourceDocument {
  url?: string;
  title?: string;
  sourceId?: string;
  rank?: number | null;
  [key: string]: unknown;
}

interface Conversation {
  id: string;
  name: string;
  messages: ChatMessage[];
  sources: Record<string, SourceDocument[]>;
}

type ChatHistoryMessage = Pick<ChatMessage, "role" | "content">;

type StreamEvent =
  | { type: "text-delta"; delta: string }
  | ({ type: "source-document" } & SourceDocument)
  | { type: "error"; errorText: string };

// ─── 工具函数 ─────────────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function createConv(name = "新对话"): Conversation {
  return { id: genId(), name, messages: [], sources: {} };
}

function loadConversations(): Conversation[] {
  try {
    const saved = JSON.parse(localStorage.getItem("rag_convs") || "[]");
    return Array.isArray(saved) && saved.length ? saved : [createConv()];
  } catch {
    return [createConv()];
  }
}

// ─── SVG 图标 ─────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const Icons = {
  plus:   "M12 5v14M5 12h14",
  send:   "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  trash:  "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  pencil: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  copy:   "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z",
  check:  "M20 6L9 17l-5-5",
  msg:    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  bot:    "M9.75 3h4.5M12 3v2M5 7h14l-1 13H6L5 7zm4 4v6m4-6v6",
};

// ─── 打字指示器 ───────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#bbb", display: "inline-block",
          animation: `ragBlink 1.2s ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── 代码块（带复制按钮）────────────────────────────────────────────────
function CodeBlock({
  language,
  value,
}: {
  language?: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ position: "relative", margin: "10px 0", borderRadius: 8, overflow: "hidden", border: "1px solid #e5e5e5" }}>
      {/* 顶栏 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 12px", background: "#f0f0ef", borderBottom: "1px solid #e5e5e5",
      }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
          {language || "code"}
        </span>
        <button onClick={copy} style={{
          display: "flex", alignItems: "center", gap: 3,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: copied ? "#2f9e44" : "#888", fontFamily: "inherit",
          padding: "2px 4px", borderRadius: 4,
        }}>
          <Icon d={copied ? Icons.check : Icons.copy} size={12} />
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneLight}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, background: "#fafaf9" }}
        showLineNumbers={value.split("\n").length > 5}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown 渲染器 ──────────────────────────────────────────────────
const mdComponents: Components = {
  // 代码块 / 行内代码
  code({ className, children, ...props }) {
    const language = /language-(\w+)/.exec(className || "")?.[1];
    const value = String(children).replace(/\n$/, "");
    if (language || value.includes("\n")) {
      return <CodeBlock language={language} value={value} />;
    }
    const codeProps = { ...props };
    delete (codeProps as { node?: unknown }).node;
    return (
      <code style={{
        background: "#f0f0ef", borderRadius: 4, padding: "1px 5px",
        fontSize: "0.88em", fontFamily: "monospace", color: "#c0392b",
      }} {...codeProps}>
        {children}
      </code>
    );
  },
  // 段落
  p({ children }) {
    return <p style={{ margin: "6px 0", lineHeight: 1.7 }}>{children}</p>;
  },
  // 标题
  h1({ children }) { return <h1 style={{ fontSize: 18, fontWeight: 600, margin: "14px 0 6px", borderBottom: "1px solid #eee", paddingBottom: 4 }}>{children}</h1>; },
  h2({ children }) { return <h2 style={{ fontSize: 16, fontWeight: 600, margin: "12px 0 5px" }}>{children}</h2>; },
  h3({ children }) { return <h3 style={{ fontSize: 14, fontWeight: 600, margin: "10px 0 4px" }}>{children}</h3>; },
  // 列表
  ul({ children }) { return <ul style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ul>; },
  ol({ children }) { return <ol style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ol>; },
  li({ children }) { return <li style={{ margin: "3px 0", lineHeight: 1.6 }}>{children}</li>; },
  // 引用
  blockquote({ children }) {
    return (
      <blockquote style={{
        margin: "8px 0", padding: "6px 12px",
        borderLeft: "3px solid #3b5bdb",
        background: "#f0f4ff", borderRadius: "0 6px 6px 0",
        color: "#444",
      }}>
        {children}
      </blockquote>
    );
  },
  // 表格
  table({ children }) {
    return (
      <div style={{ overflowX: "auto", margin: "10px 0" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
          {children}
        </table>
      </div>
    );
  },
  th({ children }) {
    return <th style={{ border: "1px solid #ddd", padding: "6px 10px", background: "#f5f5f4", fontWeight: 600, textAlign: "left" }}>{children}</th>;
  },
  td({ children }) {
    return <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{children}</td>;
  },
  // 分割线
  hr() { return <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />; },
  // 链接
  a({ href, children }) {
    return <a href={href} target="_blank" rel="noreferrer" style={{ color: "#3b5bdb", textDecoration: "underline" }}>{children}</a>;
  },
  // 加粗 / 斜体
  strong({ children }) { return <strong style={{ fontWeight: 600 }}>{children}</strong>; },
  em({ children }) { return <em style={{ fontStyle: "italic" }}>{children}</em>; },
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#1a1a1a", minWidth: 0 }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── 复制按钮 ──────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} style={s.copyBtn(copied)} title="复制回答">
      <Icon d={copied ? Icons.check : Icons.copy} size={13} />
      <span style={{ fontSize: 11 }}>{copied ? "已复制" : "复制"}</span>
    </button>
  );
}

// ─── 单条消息 ──────────────────────────────────────────────────────────
function Message({
  msg,
  isStreaming,
}: {
  msg: ChatMessage;
  isStreaming: boolean;
}) {
  const isUser = msg.role === "user";
  const isAI   = msg.role === "assistant";

  return (
    <div style={s.msgRow(isUser)}>
      <div style={s.avatar(isAI)}>
        {isAI ? <Icon d={Icons.bot} size={14} /> : "你"}
      </div>
      <div style={s.bubbleWrap(isUser)}>
        <div style={s.bubble(isAI)}>
          {isAI && !msg.content && isStreaming
            ? <TypingDots />
            : isAI
              ? <MarkdownContent content={msg.content} />
              : <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14 }}>{msg.content}</span>
          }
        </div>

        {isAI && msg.content && (
          <div style={s.bubbleFooter}>
            <CopyButton text={msg.content} />
          </div>
        )}

        {/* {isAI && sources?.length > 0 && (
          <div style={s.sourceList}>
            {sources.map((src, i) => <SourceTag key={i} src={src} />)}
          </div>
        )} */}
      </div>
    </div>
  );
}

// ─── 对话条目 ──────────────────────────────────────────────────────────
function ConvItem({
  conv,
  active,
  onSelect,
  onDelete,
  onRename,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(conv.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    onRename(conv.id, draft.trim() || "新对话");
    setEditing(false);
  };

  return (
    <div onClick={() => !editing && onSelect(conv.id)} style={s.convItem(active)}>
      <Icon d={Icons.msg} size={14} />
      {editing
        ? <input ref={inputRef} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); e.stopPropagation(); }}
            onClick={(e) => e.stopPropagation()}
            style={s.renameInput}
          />
        : <span style={s.convName}>{conv.name}</span>
      }
      <div style={s.convActions}>
        <button onClick={(e) => { e.stopPropagation(); setDraft(conv.name); setEditing(true); }}
          style={s.iconBtn} title="重命名">
          <Icon d={Icons.pencil} size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
          style={{ ...s.iconBtn, color: "#d44" }} title="删除">
          <Icon d={Icons.trash} size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────
export default function RagChat() {
  const [convs, setConvs] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(
    () => convs[0]?.id ?? null,
  );
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const msgAreaRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem("rag_convs", JSON.stringify(convs));
  }, [convs]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
    const frame = requestAnimationFrame(() => {
      const el = msgAreaRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        lastScrollTopRef.current = el.scrollTop;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [activeId]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;

    const frame = requestAnimationFrame(() => {
      if (!shouldAutoScrollRef.current) return;
      const el = msgAreaRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        lastScrollTopRef.current = el.scrollTop;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [convs, streaming]);

  const handleMessagesScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (el.scrollTop < lastScrollTopRef.current) {
      shouldAutoScrollRef.current = false;
    } else if (distanceFromBottom <= AUTO_SCROLL_THRESHOLD) {
      shouldAutoScrollRef.current = true;
    }
    lastScrollTopRef.current = el.scrollTop;
  }, []);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const activeConv = convs.find((c) => c.id === activeId);

  const newConv = useCallback(() => {
    const c = createConv();
    setConvs((prev) => [c, ...prev]);
    setActiveId(c.id);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const deleteConv = useCallback((id: string) => {
    setConvs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (!next.length) { const f = createConv(); setActiveId(f.id); return [f]; }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const renameConv = useCallback((id: string, name: string) => {
    setConvs((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
  }, []);

  const updateActive = useCallback((updater: (conv: Conversation) => Conversation) => {
    setConvs((prev) => prev.map((c) => c.id === activeId ? updater(c) : c));
  }, [activeId]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || streaming || !activeConv) return;

    shouldAutoScrollRef.current = true;

    const history: ChatHistoryMessage[] = activeConv.messages.map(
      ({ role, content }) => ({ role, content }),
    );
    const userMsg: ChatMessage = { role: "user", content: q };
    const aiKey = genId();
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      _key: aiKey,
    };
    const autoName =
      activeConv.name === "新对话" && !activeConv.messages.length
        ? q.slice(0, 20) + (q.length > 20 ? "…" : "")
        : activeConv.name;

    updateActive((c) => ({
      ...c, name: autoName,
      messages: [...c.messages, userMsg, assistantMsg],
      sources: { ...c.sources, [aiKey]: [] },
    }));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setStreaming(true);

    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, userMsg] }),
      });
      if (!res.ok || !res.body) throw new Error(`请求失败: ${res.status}`);

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";

        for (const chunk of parts) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") break;
          try {
            const ev = JSON.parse(raw) as StreamEvent;
            if (ev.type === "text-delta") {
              updateActive((c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m._key === aiKey ? { ...m, content: m.content + ev.delta } : m
                ),
              }));
            } else if (ev.type === "source-document") {
              const rankMatch = ev.title?.match(/^\[(\d+)\]/);
              updateActive((c) => ({
                ...c,
                sources: {
                  ...c.sources,
                  [aiKey]: [...(c.sources[aiKey] || []), { ...ev, rank: rankMatch ? +rankMatch[1] : null }],
                },
              }));
            } else if (ev.type === "error") {
              updateActive((c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m._key === aiKey ? { ...m, content: `**错误：** ${ev.errorText}` } : m
                ),
              }));
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      const isAbortError = err instanceof Error && err.name === "AbortError";
      if (!isAbortError) {
        updateActive((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m._key ? { ...m, content: `**连接失败：** 请确认服务运行在 \`${BASE_URL}\`` } : m
          ),
        }));
      }
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, activeConv, updateActive]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const msgs = activeConv?.messages ?? [];

  return (
    <>
      <style>{`
        @keyframes ragBlink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        .rag-conv-item { position: relative; }
        .rag-conv-item .rag-actions { visibility: hidden; }
        .rag-conv-item:hover .rag-actions,
        .rag-conv-item.active .rag-actions { visibility: visible; }
        .rag-icon-btn:hover { color: #333 !important; background: #eee; }
      `}</style>

      <div style={s.root}>
        {/* 侧边栏 */}
        <aside style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={s.sidebarTitle}>对话列表</span>
            <button onClick={newConv} style={s.newBtn} title="新建对话">
              <Icon d={Icons.plus} size={13} /> 新建
            </button>
          </div>
          <div style={s.convList}>
            {convs.map((c) => (
              <ConvItem key={c.id} conv={c} active={c.id === activeId}
                onSelect={setActiveId} onDelete={deleteConv} onRename={renameConv} />
            ))}
          </div>
        </aside>

        {/* 主区域 */}
        <main style={s.main}>
          <div ref={msgAreaRef} style={s.msgArea} onScroll={handleMessagesScroll}>
            {msgs.length === 0
              ? <div style={s.empty}>
                  <Icon d={Icons.msg} size={32} />
                  <p style={{ fontSize: 14, marginTop: 8, color: "#bbb" }}>发送消息开始对话</p>
                </div>
              : msgs.map((m, i) => (
                  <Message
                    key={m._key || i}
                    msg={m}
                    isStreaming={streaming && m.role === "assistant" && i === msgs.length - 1}
                  />
                ))
            }
            <div aria-hidden="true" />
          </div>

          <div style={s.inputBar}>
            <div style={s.inputWrap}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder="输入问题，Enter 发送，Shift+Enter 换行…"
                rows={1}
                style={s.textarea}
                disabled={streaming}
              />
            </div>
            <button onClick={send} disabled={streaming || !input.trim()}
              style={s.sendBtn(streaming || !input.trim())} aria-label="发送">
              <Icon d={Icons.send} size={16} />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── 样式 ─────────────────────────────────────────────────────────────
const s: {
  root: CSSProperties;
  sidebar: CSSProperties;
  sidebarHeader: CSSProperties;
  sidebarTitle: CSSProperties;
  newBtn: CSSProperties;
  convList: CSSProperties;
  convItem: (active: boolean) => CSSProperties;
  convName: CSSProperties;
  renameInput: CSSProperties;
  convActions: CSSProperties;
  iconBtn: CSSProperties;
  main: CSSProperties;
  msgArea: CSSProperties;
  empty: CSSProperties;
  msgRow: (isUser: boolean) => CSSProperties;
  avatar: (isAI: boolean) => CSSProperties;
  bubbleWrap: (isUser: boolean) => CSSProperties;
  bubble: (isAI: boolean) => CSSProperties;
  bubbleFooter: CSSProperties;
  copyBtn: (copied: boolean) => CSSProperties;
  inputBar: CSSProperties;
  inputWrap: CSSProperties;
  textarea: CSSProperties;
  sendBtn: (disabled: boolean) => CSSProperties;
} = {
  root: { display: "flex", height: "100%", fontFamily: "system-ui,-apple-system,sans-serif", background: "#fff", overflow: "hidden" },
  sidebar: { width: 240, minWidth: 240, borderRight: "1px solid #e5e5e5", display: "flex", flexDirection: "column", background: "#f9f9f8" },
  sidebarHeader: { padding: "14px 12px 10px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" },
  sidebarTitle: { fontSize: 12, fontWeight: 500, color: "#888", letterSpacing: "0.04em", textTransform: "uppercase" },
  newBtn: { display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#333", fontFamily: "inherit" },
  convList: { flex: 1, overflowY: "auto", padding: 8 },
  convItem: (active:boolean) => ({ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: active ? "#fff" : "transparent", border: active ? "1px solid #e0e0e0" : "1px solid transparent", transition: "background 0.1s", color: "#555" }),
  convName: { flex: 1, fontSize: 13, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", color: "#222" },
  renameInput: { flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#222", fontFamily: "inherit", padding: 0 },
  convActions: { display: "flex", gap: 2 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "3px 4px", borderRadius: 4, color: "#aaa", lineHeight: 1, display: "flex", alignItems: "center", transition: "color 0.1s" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#fff" },
  msgArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb" },
  msgRow: (isUser:boolean) => ({ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }),
  avatar: (isAI:boolean) => ({ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0, background: isAI ? "#e8f0fe" : "#f0f0f0", color: isAI ? "#3b5bdb" : "#666", border: isAI ? "none" : "1px solid #e0e0e0" }),
  bubbleWrap: (isUser:boolean) => ({ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start", minWidth: 0 }),
  bubble: (isAI:boolean) => ({ padding: "10px 14px", borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px", lineHeight: 1.65, background: isAI ? "#f5f5f4" : "#3b5bdb", color: isAI ? "#1a1a1a" : "#fff", border: isAI ? "1px solid #ebebeb" : "none", maxWidth: "100%", minWidth: 0, overflowX: "auto" }),
  bubbleFooter: { display: "flex", alignItems: "center", gap: 4, paddingLeft: 2 },
  copyBtn: (copied:boolean) => ({ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, fontSize: 11, color: copied ? "#2f9e44" : "#aaa", fontFamily: "inherit", transition: "color 0.1s" }),
  inputBar: { padding: "12px 16px", borderTop: "1px solid #e5e5e5", display: "flex", gap: 8, alignItems: "flex-end", background: "#fff" },
  inputWrap: { flex: 1, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden", background: "#fff" },
  textarea: { width: "100%", resize: "none", border: "none", outline: "none", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", background: "transparent", color: "#1a1a1a", maxHeight: 120, lineHeight: 1.5, display: "block" },
  sendBtn: (disabled:boolean) => ({ background: disabled ? "#ccc" : "#3b5bdb", color: "#fff", border: "none", borderRadius: 10, width: 38, height: 38, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }),
};
