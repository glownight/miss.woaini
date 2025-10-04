import React from "react";
import { ReactReader } from "react-reader";

/**
 * 极简版本的EPUB阅读器，用于测试基础功能
 */
const MinimalEpubReader: React.FC = () => {
  // 使用最简单的配置
  const epubUrl = "/books/随笔/瓦尔登湖/瓦尔登湖.epub";
  const [location, setLocation] = React.useState<string | number>(0);

  // 检查文件是否存在的简单函数
  React.useEffect(() => {
    const checkFileExists = async () => {
      try {
        await fetch(epubUrl, { method: "HEAD" });
      } catch (error) {
        // 检查文件时出错
      }
    };

    checkFileExists();
  }, [epubUrl]);

  return (
    <div style={styles.container}>
      <h1>极简EPUB阅读器测试</h1>
      <div style={styles.readerContainer}>
        <ReactReader
          url={epubUrl}
          location={location}
          locationChanged={setLocation}
          getRendition={(rendition) => {
            try {
              // 基本配置
              rendition.themes.fontSize("100%");
            } catch (err) {
              // 配置rendition时出错
            }
          }}
        />
      </div>
      <div style={styles.debugInfo}>
        <h3>调试信息</h3>
        <p>
          <strong>当前位置:</strong> {location}
        </p>
        <p>
          <strong>文件路径:</strong> {epubUrl}
        </p>
        <p>请查看浏览器控制台获取更多调试信息</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  readerContainer: {
    width: "100%",
    height: "70vh",
    border: "1px solid #ddd",
    borderRadius: "4px",
    overflow: "hidden",
  },
  debugInfo: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
  },
};

export default MinimalEpubReader;
