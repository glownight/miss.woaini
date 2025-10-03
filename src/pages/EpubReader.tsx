import React, { useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import "./EpubReader.css";
import { AnimatePresence, motion } from "framer-motion";

interface EpubReaderProps {
  bookUrl: string;
  bookTitle: string;
  onBack: () => void;
}

const EpubReader: React.FC<EpubReaderProps> = ({
  bookUrl,
  bookTitle,
  onBack,
}) => {
  const [location, setLocation] = useState<string | number>(0);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 新增阅读设置状态
  const [lineHeight, setLineHeight] = useState(1.9);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontFamily, setFontFamily] = useState(
    "'XiaLu-WenKai', 'KaiTi', cursive"
  );
  const [showFontPanel, setShowFontPanel] = useState(false);

  // 保存rendition引用以便动态更新样式
  const [rendition, setRendition] = useState<any>(null);

  // 字体映射表
  const fontMap: { [key: string]: string } = {
    "system-ui":
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif",
    serif: "'Songti SC', 'SimSun', 'STSong', serif",
    "sans-serif":
      "'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif",
    FZSongSan: "'FZSongSan', 'SimSun', serif",
    FZYouSong: "'FZYouSong', 'SimSun', serif",
    FZLanTingHei: "'FZLanTingHei', 'Microsoft YaHei', sans-serif",
    FZLanTingYuan: "'FZLanTingYuan', 'Microsoft YaHei', sans-serif",
    FZShengShiKai: "'FZShengShiKai', 'KaiTi', 'STKaiti', cursive",
    FZJuZhenFang: "'FZJuZhenFang', 'FangSong', 'STFangsong', serif",
    FZZhengDieKai: "'FZZhengDieKai', 'KaiTi', cursive",
    CangErJinKai04: "'CangEr-JinKai-04', 'KaiTi', cursive",
    CangErJinKai05: "'CangEr-JinKai-05', 'KaiTi', cursive",
    CangErXuanSan04: "'CangEr-XuanSan-04', 'SimSun', serif",
    CangErXuanSan05: "'CangEr-XuanSan-05', 'SimSun', serif",
    CangErYunHei04: "'CangEr-YunHei-04', 'Microsoft YaHei', sans-serif",
    CangErYunHei05: "'CangEr-YunHei-05', 'Microsoft YaHei', sans-serif",
    CangErMingKai04: "'CangEr-MingKai-04', 'KaiTi', cursive",
    CangErMingKai05: "'CangEr-MingKai-05', 'KaiTi', cursive",
    CangErZhuangYuanKai: "'CangEr-ZhuangYuanKai', 'KaiTi', cursive",
    CangErLanKai: "'CangEr-LanKai', 'KaiTi', cursive",
    CangErHuaXin: "'CangEr-HuaXin', 'SimSun', serif",
    CangErYuKai: "'CangEr-YuKai', 'KaiTi', cursive",
    JingHuaLaoSong: "'JingHua-LaoSong', 'SimSun', serif",
    HanChanYuSong: "'HanChan-YuSong', 'SimSun', serif",
    HanYiKongShanKai: "'HanYi-KongShanKai', 'KaiTi', cursive",
    HuiWenZhengKai: "'HuiWen-ZhengKai', 'KaiTi', cursive",
    HanChanZhengKai: "'HanChan-ZhengKai', 'KaiTi', cursive",
    XiaLuWenKai: "'XiaLu-WenKai', 'KaiTi', cursive",
    AIKai: "'AI-Kai', 'KaiTi', cursive",
  };

  // 应用字体
  const applyFont = (fontKey: string) => {
    const actualFont = fontMap[fontKey] || fontKey;
    setFontFamily(actualFont);
    // setShowFontPanel(false);
  };

  // 检查字体是否激活
  const isFontActive = (fontKey: string) => {
    const targetFont = fontMap[fontKey];
    return fontFamily === targetFont;
  };

  // 初始化时设置主题
  useEffect(() => {
    const savedTheme = localStorage.getItem("readerTheme") as
      | "light"
      | "dark"
      | "sepia"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 切换主题
  const changeTheme = (newTheme: "light" | "dark" | "sepia") => {
    setTheme(newTheme);
    localStorage.setItem("readerTheme", newTheme);
  };

  // 调整字体大小
  const changeFontSize = (delta: number) => {
    setFontSize((prev) => {
      const newSize = Math.max(12, Math.min(24, prev + delta));
      return newSize;
    });
  };

  // 切换设置面板
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("无法进入全屏模式:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 当样式设置变化时，重新应用到rendition
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}px`);
      rendition.themes.override("line-height", `${lineHeight}`);
      rendition.themes.override("letter-spacing", `${letterSpacing}px`);
      rendition.themes.override("font-family", fontFamily);

      // 应用主题样式
      if (theme === "dark") {
        rendition.themes.override("color", "#b8b8b8");
        rendition.themes.override("background", "#0d0d0d");
      } else if (theme === "light") {
        rendition.themes.override("color", "#333333");
        rendition.themes.override("background", "#ffffff");
      } else if (theme === "sepia") {
        rendition.themes.override("color", "#5c4b37");
        rendition.themes.override("background", "#f4f1e8");
      }
    }
  }, [fontSize, lineHeight, letterSpacing, fontFamily, theme, rendition]);

  return (
    <div
      className={`epub-reader-novel ${theme} ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      {!isFullscreen && (
        <header className="reader-top-nav">
          <div className="nav-left">
            <span className="book-title-nav">{bookTitle}</span>
          </div>
          <div className="nav-right">
            {/* 工具栏按钮组 */}
            <div className="nav-toolbar-buttons">
              {/* 字体大小 */}
              <button
                className="toolbar-btn"
                title="减小字号"
                onClick={() => changeFontSize(-1)}
              >
                <span className="font-text" style={{ fontSize: "11px" }}>
                  A-
                </span>
              </button>
              <button
                className="toolbar-btn"
                title="增大字号"
                onClick={() => changeFontSize(1)}
              >
                <span className="font-text" style={{ fontSize: "13px" }}>
                  A+
                </span>
              </button>

              {/* 字体类型/设置 */}
              <button
                className="toolbar-btn"
                title="字体设置"
                onClick={() => setShowFontPanel(!showFontPanel)}
              >
                <span className="font-text">字</span>
              </button>

              {/* 行间距 */}
              <button
                className="toolbar-btn"
                title="行间距"
                onClick={() =>
                  setLineHeight(
                    lineHeight === 1.9 ? 2.2 : lineHeight === 2.2 ? 1.6 : 1.9
                  )
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="3"
                    y1="18"
                    x2="21"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {/* 字间距 */}
              <button
                className="toolbar-btn"
                title="字间距"
                onClick={() =>
                  setLetterSpacing(
                    letterSpacing === 0 ? 1 : letterSpacing === 1 ? 2 : 0
                  )
                }
              >
                <span className="font-text" style={{ letterSpacing: "2px" }}>
                  间
                </span>
              </button>

              {/* 背景色 */}
              <button
                className="toolbar-btn"
                title="背景颜色"
                onClick={() =>
                  changeTheme(
                    theme === "dark"
                      ? "light"
                      : theme === "light"
                      ? "sepia"
                      : "dark"
                  )
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M12 4v16M4 12h16"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {/* 全屏 */}
              <button
                className="toolbar-btn"
                title={isFullscreen ? "退出全屏" : "全屏"}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <span className="divider">|</span>
            <button>我的书桌</button>
          </div>
        </header>
      )}

      {/* 全屏模式下的右侧垂直工具栏 */}
      {isFullscreen && (
        <aside className="right-toolbar">
          <button className="toolbar-btn" title="目录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
          <button className="toolbar-btn" title="AI">
            <span className="ai-text">AI</span>
          </button>
          <button className="toolbar-btn" title="编辑">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="toolbar-btn" title="复制">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
          <button className="toolbar-btn" title="设置" onClick={toggleSettings}>
            <span className="font-text">Aa</span>
          </button>
          <button
            className="toolbar-btn"
            title="退出全屏"
            onClick={toggleFullscreen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </aside>
      )}

      {/* 字体选择面板 */}
      <AnimatePresence>
        {showFontPanel && (
          <motion.div
            className="font-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="font-panel-header">
              <span>字体</span>
              <button
                onClick={() => setShowFontPanel(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="font-categories">
              <button className="active">全部(29)</button>
              <button>仓耳(12)</button>
              <button>方正(7)</button>
              <button>其他(9)</button>
            </div>
            <div className="font-grid">
              <button
                className={
                  isFontActive("system-ui") ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("system-ui")}
              >
                系统字体
              </button>
              <button
                className={
                  isFontActive("serif") ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("serif")}
                style={{ fontFamily: "'SimSun', serif" }}
              >
                思源宋体
              </button>
              <button
                className={
                  isFontActive("sans-serif") ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("sans-serif")}
                style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}
              >
                思源黑体
              </button>
              <button
                className={
                  isFontActive("FZSongSan") ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("FZSongSan")}
              >
                方正宋三
              </button>
              <button
                className={
                  fontFamily === "FZYouSong" ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("FZYouSong")}
              >
                方正悠宋
              </button>
              <button
                className={
                  fontFamily === "FZLanTingHei"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("FZLanTingHei")}
              >
                方正兰亭黑
              </button>
              <button
                className={
                  fontFamily === "FZLanTingYuan"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("FZLanTingYuan")}
              >
                方正兰亭圆
              </button>
              <button
                className={
                  fontFamily === "FZShengShiKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("FZShengShiKai")}
              >
                方正盛世楷书
              </button>
              <button
                className={
                  fontFamily === "FZJuZhenFang"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("FZJuZhenFang")}
              >
                方正聚珍新仿
              </button>
              <button
                className={
                  fontFamily === "FZZhengDieKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("FZZhengDieKai")}
              >
                方正政蝶正楷
              </button>
              <button
                className={
                  fontFamily === "CangErJinKai04"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErJinKai04")}
              >
                仓耳今楷 04
              </button>
              <button
                className={
                  fontFamily === "CangErJinKai05"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErJinKai05")}
              >
                仓耳今楷 05
              </button>
              <button
                className={
                  fontFamily === "CangErXuanSan04"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErXuanSan04")}
              >
                仓耳玄三 04
              </button>
              <button
                className={
                  fontFamily === "CangErXuanSan05"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErXuanSan05")}
              >
                仓耳玄三 05
              </button>
              <button
                className={
                  fontFamily === "CangErYunHei04"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErYunHei04")}
              >
                仓耳云黑 04
              </button>
              <button
                className={
                  fontFamily === "CangErYunHei05"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErYunHei05")}
              >
                仓耳云黑 05
              </button>
              <button
                className={
                  fontFamily === "CangErMingKai04"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErMingKai04")}
              >
                仓耳明楷 04
              </button>
              <button
                className={
                  fontFamily === "CangErMingKai05"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErMingKai05")}
              >
                仓耳明楷 05
              </button>
              <button
                className={
                  fontFamily === "CangErZhuangYuanKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErZhuangYuanKai")}
              >
                仓耳状元楷
              </button>
              <button
                className={
                  fontFamily === "CangErLanKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErLanKai")}
              >
                仓耳兰楷
              </button>
              <button
                className={
                  fontFamily === "CangErHuaXin"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErHuaXin")}
              >
                仓耳华新
              </button>
              <button
                className={
                  fontFamily === "CangErYuKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("CangErYuKai")}
              >
                仓耳玉楷
              </button>
              <button
                className={
                  fontFamily === "JingHuaLaoSong"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("JingHuaLaoSong")}
              >
                京华老宋体
              </button>
              <button
                className={
                  fontFamily === "HanChanYuSong"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("HanChanYuSong")}
              >
                寒蝉语宋体
              </button>
              <button
                className={
                  fontFamily === "HanYiKongShanKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("HanYiKongShanKai")}
              >
                汉仪空山楷
              </button>
              <button
                className={
                  fontFamily === "HuiWenZhengKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("HuiWenZhengKai")}
              >
                汇文正楷
              </button>
              <button
                className={
                  fontFamily === "HanChanZhengKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("HanChanZhengKai")}
              >
                寒蝉正楷体
              </button>
              <button
                className={
                  fontFamily === "XiaLuWenKai"
                    ? "font-item active"
                    : "font-item"
                }
                onClick={() => applyFont("XiaLuWenKai")}
              >
                霞鹭文楷
              </button>
              <button
                className={
                  fontFamily === "AIKai" ? "font-item active" : "font-item"
                }
                onClick={() => applyFont("AIKai")}
              >
                AI楷
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel-novel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="setting-group">
              <label>字体大小</label>
              <div className="font-size-controls">
                <button onClick={() => changeFontSize(-2)}>A-</button>
                <span>{fontSize}px</span>
                <button onClick={() => changeFontSize(2)}>A+</button>
              </div>
            </div>

            <div className="setting-group">
              <label>行间距: {lineHeight.toFixed(1)}</label>
              <input
                type="range"
                min="1.2"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="setting-slider"
              />
            </div>

            <div className="setting-group">
              <label>字间距: {letterSpacing}px</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                className="setting-slider"
              />
            </div>

            <div className="setting-group">
              <label>主题</label>
              <div className="theme-buttons">
                <button
                  className={theme === "light" ? "active" : ""}
                  onClick={() => changeTheme("light")}
                >
                  明亮
                </button>
                <button
                  className={theme === "dark" ? "active" : ""}
                  onClick={() => changeTheme("dark")}
                >
                  暗黑
                </button>
                <button
                  className={theme === "sepia" ? "active" : ""}
                  onClick={() => changeTheme("sepia")}
                >
                  护眼
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EPUB阅读区域 */}
      <div className="epub-reading-area" style={{ fontSize: `${fontSize}px` }}>
        <div className="epub-content">
          <ReactReader
            url={bookUrl}
            location={location}
            locationChanged={(epubcfi: string) => setLocation(epubcfi)}
            epubOptions={{
              flow: "paginated",
              manager: "continuous",
            }}
            getRendition={(rend) => {
              // 保存rendition引用
              setRendition(rend);

              // 应用字体大小
              rend.themes.fontSize(`${fontSize}px`);

              // 应用行间距
              rend.themes.override("line-height", `${lineHeight}`);

              // 应用字间距
              rend.themes.override("letter-spacing", `${letterSpacing}px`);

              // 应用字体
              rend.themes.override("font-family", fontFamily);

              // 应用主题样式
              if (theme === "dark") {
                rend.themes.override("color", "#b8b8b8");
                rend.themes.override("background", "#0d0d0d");
              } else if (theme === "light") {
                rend.themes.override("color", "#333333");
                rend.themes.override("background", "#ffffff");
              } else if (theme === "sepia") {
                rend.themes.override("color", "#5c4b37");
                rend.themes.override("background", "#f4f1e8");
              }
            }}
            tocChanged={(toc) => console.log(toc)}
          />
        </div>
      </div>
    </div>
  );
};

export default EpubReader;
