import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Fireworks from "./components/Fireworks";
// import TypeWriter from "./components/TypeWriter";
import QuoteSwiper from "./components/QuoteSwiper";
import MarkdownViewer from "./pages/MarkdownViewer";
import LockScreen from "./components/LockScreen";
import {
  getMdFileList,
  titleToFileName,
  getAllCategoriesData,
  folderConfig,
} from "./utils/mdUtils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function App() {
  const location = useLocation();
  const [fireworksOn, setFireworksOn] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 新增tab状态
  const [isLocked, setIsLocked] = useState(true); // 锁屏状态
  const [categoriesData, setCategoriesData] = useState<Record<string, any[]>>(
    {}
  );
  const [musicTracks, setMusicTracks] = useState<
    Array<{
      title: string;
      fileName: string;
      folderKey?: string;
      plays: string;
      comments: string;
    }>
  >([]);
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键词
  const [sortBy, setSortBy] = useState<"title" | "alphabetical" | "alphabetical-reverse">("title"); // 排序方式
  const [isLoading, setIsLoading] = useState(true); // 加载状态

  // 检查解锁令牌
  useEffect(() => {
    const unlockToken = sessionStorage.getItem("unlockToken");
    if (unlockToken) {
      try {
        const decoded = atob(unlockToken);
        if (decoded.startsWith("unlocked_")) {
          const timestamp = parseInt(decoded.split("_")[1]);
          // 令牌有效期为1小时
          if (Date.now() - timestamp < 3600000) {
            setIsLocked(false);
          } else {
            sessionStorage.removeItem("unlockToken");
          }
        }
      } catch (error) {
        sessionStorage.removeItem("unlockToken");
      }
    }
  }, []);

  // 动态加载MD文件列表
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const allCategories = getAllCategoriesData();
        setCategoriesData(allCategories);

        // 合并所有数据作为默认显示
        const tracks = getMdFileList();
        setMusicTracks(tracks);
      } catch (error) {
        console.error("加载文件数据失败:", error);
        // 设置空数据以避免页面崩溃
        setCategoriesData({});
        setMusicTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // const shortTracks = [
  //   { title: "Ain't I Lost Control", plays: "48570", comments: "0" },
  //   { title: "仰世而来（Demo）", plays: "32145", comments: "0" },
  // ];

  const projects = [
    {
      name: "音视频",
      desc: "使用纯JavaScript实现，涵盖了Web音视频开发的核心技术",
      tech: ["Js"],
      demo: "yinshipin.miss.xn--6qq986b3xl",
      github: " `https://github.com/glownight/yinshipin` ",
    },
    {
      name: "智能助手",
      desc: "一个基于React的智能助手",
      tech: ["React"],
      demo: "ai.miss.xn--6qq986b3xl",
      github: " `https://github.com/glownight/aigc` ",
    },
    {
      name: "classroom",
      desc: "使用Threejs开发的3D项目",
      tech: ["Threejs"],
      demo: "classroom.miss.xn--6qq986b3xl",
      github: " `https://github.com/glownight/threejs-classroom` ",
    },
    {
      name: "tools",
      desc: "一个基于React的工具库",
      tech: ["React", "Js"],
      demo: "tools.miss.xn--6qq986b3xl",
      github: " `https://github.com/glownight/tools-web-react` ",
    },
  ];

  // 将歌曲标题转换为文件名格式
  const getMarkdownFilename = (title: string) => {
    return titleToFileName(title);
  };

  const isHome = location.pathname === "/" || location.pathname === "/home";
  // 统一外链格式：去掉首尾反引号/空格，若无协议则自动补 https://
  const toUrl = (url: string) => {
    if (!url) return "#";
    const trimmed = url.trim().replace(/^`|`$/g, "");
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  // 根据tab、搜索和排序筛选数据
  const getFilteredTracks = () => {
    let filteredTracks = musicTracks;

    // 根据tab筛选
    if (activeTab !== "all" && activeTab in categoriesData) {
      filteredTracks = categoriesData[activeTab] || [];
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTracks = filteredTracks.filter((track) =>
        track.title.toLowerCase().includes(query)
      );
    }

    // 排序
    filteredTracks = [...filteredTracks].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title, "zh-CN");
      } else if (sortBy === "alphabetical-reverse") {
        return b.title.localeCompare(a.title, "zh-CN");
      }
      return 0;
    });

    return filteredTracks;
  };

  // 如果处于锁屏状态，显示锁屏界面
  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="app">
      {/* Fireworks canvas */}
      <Fireworks enabled={fireworksOn} />

      {/* 锁屏按钮 */}
      <motion.button
        className="lock-btn"
        onClick={() => setIsLocked(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        🔒
      </motion.button>

      {/* Page header maroon area */}
      <header className="page-header">
        {/* 装饰元素 - 柔和苹果风格 */}
        <div className="header-decorations">
          <div className="decor-shape decor-shape-1"></div>
          <div className="decor-shape decor-shape-2"></div>
          <div className="decor-shape decor-shape-3"></div>
          <div className="decor-line decor-line-1"></div>
          <div className="decor-line decor-line-2"></div>
          <div className="decor-line decor-line-3"></div>
          <div className="decor-dot decor-dot-1"></div>
          <div className="decor-dot decor-dot-2"></div>
          <div className="decor-dot decor-dot-3"></div>
          <div className="decor-dot decor-dot-4"></div>
          <div className="decor-dot decor-dot-5"></div>
          <div className="decor-dot decor-dot-6"></div>
          <div className="decor-dot decor-dot-7"></div>
          <div className="decor-dot decor-dot-8"></div>
          <div className="decor-dot decor-dot-9"></div>
          <div className="decor-center decor-center-1"></div>
          <div className="decor-center decor-center-2"></div>
          <div className="decor-center decor-center-3"></div>
          <div className="decor-center decor-center-4"></div>
          <div className="decor-center decor-center-5"></div>
          <div className="decor-center decor-center-6"></div>
          <div className="decor-center-line decor-center-line-1"></div>
          <div className="decor-center-line decor-center-line-2"></div>
          <div className="decor-center-line decor-center-line-3"></div>
        </div>

        <div className="container header-inner">
          <div className="header-left">
            <h1 className="site-title">
              {/* <TypeWriter text="热爱可抵岁月漫长~" /> */}
            </h1>
            <div className="subnav">
              <Link className={isHome ? "active" : ""} to="/">
                「荒诞故事」
              </Link>
              {/* <Link
                className={location.pathname === "/bookmarks" ? "active" : ""}
                to="/bookmarks"
              >
                印记
              </Link> */}
              <Link
                className={location.pathname === "/resume" ? "active" : ""}
                to="/resume"
              >
                印记
              </Link>
            </div>
          </div>
          <div className="header-right">
            <div className="header-avatar">{/* 头像位 */}</div>
            <button
              type="button"
              className={`kawaii-toggle ${fireworksOn ? "on" : "off"}`}
              onClick={() => setFireworksOn((v) => !v)}
              aria-pressed={fireworksOn}
              aria-label={fireworksOn ? "关闭烟花" : "开启烟花"}
            >
              <span className="spark">✦</span>
              <span className="face">^_^</span>
              <span className="label">{fireworksOn ? "" : ""}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Two columns: left main, right sidebar */}
      <div className="container columns">
        {/* Left main */}
        <main className="main-left">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section className="card notice-card">
                    <QuoteSwiper />
                  </section>
                </>
              }
            />

            <Route
              path="/projects"
              element={
                <>
                  {/* 资料卡（与主页一致） */}
                  <section className="card notice-card">
                    <section className="card profile-card">
                      <div className="profile-header">
                        <h3 className="profile-name">sl</h3>
                        <p className="profile-subtitle">前端工程师</p>
                      </div>
                    </section>
                  </section>

                  {/* 项目列表（项目集路由） */}
                  <section className="card project-card">
                    <div className="section-header">
                      <h2>「项目」</h2>
                    </div>
                    <div className="project-list">
                      {projects.map((p, i) => (
                        <div key={i} className="project-item">
                          <div className="project-main">
                            <a
                              className="project-title"
                              href={toUrl(p.demo)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {p.name}
                            </a>
                            <p className="project-desc">{p.desc}</p>
                            <div className="project-tags">
                              {p.tech.map((t, idx) => (
                                <span className="tag" key={idx}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="project-actions">
                            <a
                              className="link-btn"
                              href={toUrl(p.demo)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              预览
                            </a>
                            {/* <a
                              className="link-btn"
                              href={toUrl(p.github)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              GitHub
                            </a> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              }
            />

            {/* MD文档页面路由 */}
            <Route path="/song/:filename" element={<MarkdownViewer />} />

            {/* 印记导航页路由 */}
            <Route
              path="/bookmarks"
              element={<MarkdownViewer filename="印记导航" />}
            />

            {/* 个人简历页路由 */}
            <Route
              path="/resume"
              element={<MarkdownViewer filename="个人简历" />}
            />

            {/* 兼容 /home 与未知路由 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Right sidebar with tabs - 始终显示 */}
        <aside className="sidebar-right">
          <div className="card tab-card">
            <div className="tab-header">
              {Object.entries(folderConfig).map(([key, config]) => {
                const categoryData = categoriesData[key] || [];
                const fileCount = categoryData.length;
                const hasFiles = fileCount > 0;

                return (
                  <button
                    key={key}
                    className={`tab-btn ${activeTab === key ? "active" : ""} ${
                      !hasFiles ? "empty" : ""
                    }`}
                    onClick={() => setActiveTab(key)}
                    title={hasFiles ? `${fileCount} 篇文章` : "空文件夹"}
                  >
                    <span className="tab-label">{config.label}</span>
                    {hasFiles && (
                      <span className="file-count">{fileCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 搜索和排序控件 - 只在选择了具体分类后显示 */}
          {activeTab !== "all" && (
            <div className="card search-sort-card">
              <div className="search-sort-controls">
                {/* 搜索框 */}
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="搜索文章标题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchQuery("")}
                      aria-label="清除搜索"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* 排序选项 */}
                <div className="sort-options">
                  <label>排序方式：</label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "title" | "folder")
                    }
                    className="sort-select"
                  >
                    <option value="alphabetical">按字母顺序</option>
                    <option value="alphabetical-reverse">按字母倒序</option>
                  </select>
                </div>
              </div>

              {/* 搜索结果统计 */}
              {searchQuery.trim() && (
                <div className="search-stats">
                  找到 {getFilteredTracks().length} 个结果
                </div>
              )}
            </div>
          )}

          {/* 文章列表显示在右侧 - 只在选择了具体分类后显示 */}
          {activeTab !== "all" && (
            <div className="card music-card">
              {/* <div className="section-header">
                <h2>
                  「
                  {folderConfig[activeTab as keyof typeof folderConfig]
                    ?.label || activeTab}
                  」
                </h2>
              </div> */}
              <div className="music-table">
                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>正在加载文章...</p>
                  </div>
                ) : getFilteredTracks().length > 0 ? (
                  getFilteredTracks().map((track, i) => (
                    <div key={`${activeTab}-${i}`} className="track-row">
                      <Link
                        to={`/song/${getMarkdownFilename(track.title)}`}
                        className="track-title"
                      >
                        {track.title}
                      </Link>
                      <div className="track-meta">
                        <span className="track-folder">
                          分类:{" "}
                          {folderConfig[track.folderKey]?.label ||
                            track.folderKey}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    {searchQuery.trim() ? (
                      <>
                        <p>没有找到匹配"{searchQuery}"的文章</p>
                        <button
                          className="clear-search-btn"
                          onClick={() => setSearchQuery("")}
                        >
                          清除搜索
                        </button>
                      </>
                    ) : (
                      <p>该分类下暂无文章</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
