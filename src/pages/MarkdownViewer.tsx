import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "./MarkdownViewer.css";
import "highlight.js/styles/github-dark.css";

const MarkdownViewer = () => {
  const { filename } = useParams<{ filename: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadMarkdown = async () => {
      if (!filename) return;

      try {
        setLoading(true);
        // 动态导入MD文件，使用原始文件名
        const mdModule = await import(`../datas/mds/${filename}.md?raw`);
        setContent(mdModule.default);
      } catch (err) {
        setError(`无法加载文档: ${filename}.md`);
        console.error("Error loading markdown:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filename]);

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
      <div className="markdown-header">
        <Link to="/" className="back-link">
          ← 返回首页
        </Link>
      </div>
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // 自定义组件渲染
            h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
            h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
            h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
            h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
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
      </div>
    </div>
  );
};

export default MarkdownViewer;
