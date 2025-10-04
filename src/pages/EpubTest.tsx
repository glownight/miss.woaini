import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 用于直接测试EPUB文件加载的简单页面
 */
const EpubTest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fileExists, setFileExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);

  const epubUrl = "/books/随笔/瓦尔登湖/瓦尔登湖.epub";

  useEffect(() => {
    const testEpubFile = async () => {
      try {
        // 发送HEAD请求检查文件是否存在
        const headResponse = await fetch(epubUrl, {
          method: "HEAD",
          headers: {
            Accept: "application/epub+zip, application/octet-stream",
          },
        });

        if (headResponse.ok) {
          setFileExists(true);

          // 获取文件信息
          const contentType = headResponse.headers.get("content-type");
          const contentLength = headResponse.headers.get("content-length");

          setFileInfo({
            contentType,
            contentLength,
            headers: Array.from(headResponse.headers.entries()).reduce(
              (obj, [key, value]) => ({
                ...obj,
                [key]: value,
              }),
              {}
            ),
          });

          // 尝试下载一小部分文件
          try {
            const partialResponse = await fetch(epubUrl, {
              method: "GET",
              headers: {
                Range: "bytes=0-1023",
                Accept: "application/epub+zip",
              },
            });

            if (partialResponse.ok || partialResponse.status === 206) {
            } else {
              setError(`部分下载失败，状态码: ${partialResponse.status}`);
            }
          } catch (downloadError) {
            setError(
              `部分下载时出错: ${
                downloadError instanceof Error
                  ? downloadError.message
                  : String(downloadError)
              }`
            );
          }
        } else {
          setFileExists(false);
          setError(`文件不存在或无法访问，状态码: ${headResponse.status}`);
        }
      } catch (err) {
        setError(
          `测试过程中出错: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };

    testEpubFile();
  }, [epubUrl]);

  return (
    <div style={styles.container}>
      <h1>EPUB文件加载测试</h1>

      <div style={styles.infoSection}>
        <h2>测试文件路径</h2>
        <p>{epubUrl}</p>
        <a
          href={epubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          直接下载测试
        </a>
      </div>

      {loading && <div style={styles.loading}>正在测试EPUB文件加载...</div>}

      {error && <div style={styles.error}>{error}</div>}

      {fileExists && fileInfo && (
        <div style={styles.successSection}>
          <h2 style={styles.successTitle}>✓ 文件存在且可访问</h2>

          <div style={styles.fileInfo}>
            <h3>文件信息</h3>
            <p>
              <strong>内容类型:</strong> {fileInfo.contentType}
            </p>
            <p>
              <strong>文件大小:</strong>{" "}
              {fileInfo.contentLength
                ? `${(parseInt(fileInfo.contentLength) / 1024 / 1024).toFixed(
                    2
                  )} MB`
                : "未知"}
            </p>
          </div>

          <div style={styles.nextSteps}>
            <h3>下一步</h3>
            <p>文件加载测试成功！问题可能出在ReactReader组件的配置上。</p>
            <button
              onClick={() => navigate("/epub-test")}
              style={styles.button}
            >
              返回EPUB阅读器
            </button>
          </div>
        </div>
      )}

      {!fileExists && !loading && !error && (
        <div style={styles.warning}>
          无法确定文件状态，请查看控制台日志获取详情。
        </div>
      )}

      <div style={styles.debugInfo}>
        <h3>调试提示</h3>
        <p>请打开浏览器控制台查看完整的调试信息。</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  infoSection: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
  },
  link: {
    color: "#0066cc",
    textDecoration: "none",
  },
  loading: {
    padding: "20px",
    textAlign: "center",
    fontSize: "16px",
  },
  error: {
    padding: "15px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  warning: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    color: "#856404",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  successSection: {
    marginBottom: "20px",
  },
  successTitle: {
    color: "#2e7d32",
    marginBottom: "15px",
  },
  fileInfo: {
    padding: "15px",
    backgroundColor: "#e8f5e9",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  nextSteps: {
    padding: "15px",
    backgroundColor: "#e3f2fd",
    borderRadius: "5px",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  debugInfo: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
  },
};

export default EpubTest;
