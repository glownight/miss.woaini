import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./MarkdownViewer.css";

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
        // 动态导入MD文件
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

  // 简单的Markdown渲染函数
  const renderMarkdown = (markdown: string) => {
    return markdown
      .split('\n')
      .map((line, index) => {
        // 标题处理
        if (line.startsWith('# ')) {
          return <h1 key={index}>{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index}>{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index}>{line.substring(4)}</h3>;
        }
        
        // 列表处理
        if (line.startsWith('- ')) {
          return <li key={index}>{line.substring(2)}</li>;
        }
        
        // 粗体处理
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={index}>
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          );
        }
        
        // 空行处理
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // 普通段落
        return <p key={index}>{line}</p>;
      });
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
        <Link to="/" className="back-link">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="markdown-viewer">
      <div className="markdown-header">
        <Link to="/" className="back-link">← 返回首页</Link>
      </div>
      <div className="markdown-content">
        {renderMarkdown(content)}
      </div>
    </div>
  );
};

export default MarkdownViewer;