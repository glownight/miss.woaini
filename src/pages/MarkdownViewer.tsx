import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "./MarkdownViewer.css";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
  filename?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  filename: propFilename,
}) => {
  const { filename: urlFilename } = useParams<{ filename: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toc, setToc] = useState<
    Array<{ level: number; text: string; id: string }>
  >([]);
  const [collapsedItems, setCollapsedItems] = useState<Set<number>>(new Set());

  // 优先使用props传递的filename，如果没有则使用URL参数
  const filename = propFilename || urlFilename;

  useEffect(() => {
    const loadMarkdown = async () => {
      if (!filename) return;

      try {
        setLoading(true);

        console.log("加载文件:", filename);

        // 使用 import.meta.glob 来动态加载所有 md 文件
        const mdFiles = import.meta.glob("../datas/**/*.md", {
          query: "?raw",
          import: "default",
          eager: false,
        });

        console.log("可用文件:", Object.keys(mdFiles));

        // 查找匹配的文件
        let targetPath = null;
        for (const path of Object.keys(mdFiles)) {
          const pathFileName = path.split("/").pop()?.replace(".md", "") || "";
          if (pathFileName === filename) {
            targetPath = path;
            break;
          }
        }

        if (targetPath) {
          console.log("找到文件:", targetPath);
          const mdModule = await mdFiles[targetPath]();
          const mdContent = mdModule as string;
          setContent(mdContent);

          // 提取目录
          const extractedToc = extractToc(mdContent);
          console.log("提取到的目录:", extractedToc);
          console.log("目录数量:", extractedToc.length);
          setToc(extractedToc);

          // 三级标题及更深层默认启动折叠
          const defaultCollapsed = new Set<number>();
          extractedToc.forEach((item, index) => {
            if (item.level >= 2) {
              defaultCollapsed.add(index);
            }
          });
          setCollapsedItems(defaultCollapsed);
        } else {
          throw new Error(`找不到文件: ${filename}.md`);
        }
      } catch (err) {
        setError(`无法加载文档: ${filename}.md`);
        console.error("Error loading markdown:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filename]);

  // 提取目录函数
  const extractToc = (
    mdContent: string
  ): Array<{ level: number; text: string; id: string }> => {
    const toc: Array<{ level: number; text: string; id: string }> = [];
    const lines = mdContent.split("\n");

    for (const line of lines) {
      // 匹配标题行（# 开头），支持中文
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length; // #的数量就是级别
        const text = headingMatch[2].trim();
        // 生成ID：移除特殊字符，用-连接
        const id = text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+$/, "");

        toc.push({ level, text, id });
        console.log(`提取到标题: 级别${level}, 文本"${text}", ID"${id}"`);
      }
    }

    console.log(`总共提取到 ${toc.length} 个标题`);
    return toc;
  };

  // 切换折叠状态
  const toggleCollapse = (index: number) => {
    setCollapsedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 检查是否应该显示目录项（考虑折叠状态）
  const shouldShowItem = (index: number): boolean => {
    if (index === 0) return true; // 第一个总是显示

    const currentItem = toc[index];
    let currentLevel = currentItem.level;

    // 检查所有父级是否被折叠
    for (let i = index - 1; i >= 0; i--) {
      if (toc[i].level < currentLevel) {
        // 找到父级，检查是否被折叠
        if (collapsedItems.has(i)) {
          return false;
        }
        // 继续向上查找更高级别的父级
        currentLevel = toc[i].level;
      }
    }

    return true;
  };

  if (loading) {
    return (
      <div className="markdown-viewer">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="markdown-viewer">
        <div className="error">{error}</div>
        <Link to="/" className="back-link">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="markdown-viewer">
      {/* 调试信息 */}
      <div style={{ display: "none" }}>
        <p>目录数量: {toc.length}</p>
        <p>目录内容: {JSON.stringify(toc)}</p>
      </div>

      {/* 双栏布局：左侧目录 + 右侧内容 */}
      <div className="markdown-layout">
        {/* 左侧目录 */}
        {toc.length > 0 && (
          <aside className="markdown-toc">
            <div className="toc-header">
              <h3>目录</h3>
            </div>
            <nav className="toc-nav">
              <ul className="toc-list">
                {toc.map((item, index) => {
                  const hasChildren =
                    index < toc.length - 1 && toc[index + 1].level > item.level;
                  const isCollapsed = collapsedItems.has(index);
                  const shouldShow = shouldShowItem(index);

                  if (!shouldShow) return null;

                  return (
                    <li
                      key={index}
                      className={`toc-item toc-level-${item.level}`}
                      style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                    >
                      <div className="toc-item-content">
                        {hasChildren ? (
                          <button
                            className="toc-collapse-btn"
                            onClick={() => toggleCollapse(index)}
                            aria-label={isCollapsed ? "展开" : "折叠"}
                          >
                            {isCollapsed ? "▶" : "▼"}
                          </button>
                        ) : (
                          <span className="toc-placeholder"></span>
                        )}
                        <a
                          href={`#${item.id}`}
                          className="toc-link"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(item.id);
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                        >
                          {item.text}
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* 右侧内容 */}
        <main className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              // 自定义组件渲染，为标题添加ID
              h1: ({ children }) => {
                const text = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+$/, "");
                return (
                  <h1 className="md-h1" id={id}>
                    {children}
                  </h1>
                );
              },
              h2: ({ children }) => {
                const text = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+$/, "");
                return (
                  <h2 className="md-h2" id={id}>
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+$/, "");
                return (
                  <h3 className="md-h3" id={id}>
                    {children}
                  </h3>
                );
              },
              h4: ({ children }) => {
                const text = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+$/, "");
                return (
                  <h4 className="md-h4" id={id}>
                    {children}
                  </h4>
                );
              },
              p: ({ children }) => <p className="md-p">{children}</p>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="md-blockquote">{children}</blockquote>
              ),
              code: ({ className, children, ...props }) => {
                // const match = /language-(\w+)/.exec(className || '');
                const inline = (props as any)?.inline;
                return !inline ? (
                  <pre className="md-pre">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="md-code-inline" {...props}>
                    {children}
                  </code>
                );
              },
              table: ({ children }) => (
                <table className="md-table">{children}</table>
              ),
              thead: ({ children }) => (
                <thead className="md-thead">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="md-tbody">{children}</tbody>
              ),
              tr: ({ children }) => <tr className="md-tr">{children}</tr>,
              th: ({ children }) => <th className="md-th">{children}</th>,
              td: ({ children }) => <td className="md-td">{children}</td>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="md-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              hr: () => <hr className="md-hr" />,
              strong: ({ children }) => (
                <strong className="md-strong">{children}</strong>
              ),
              em: ({ children }) => <em className="md-em">{children}</em>,
            }}
          >
            {content}
          </ReactMarkdown>
        </main>
      </div>
    </div>
  );
};

export default MarkdownViewer;
