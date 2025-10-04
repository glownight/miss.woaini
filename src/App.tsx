import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Fireworks from "./components/Fireworks";
// import TypeWriter from "./components/TypeWriter";
import QuoteSwiper from "./components/QuoteSwiper";
import MarkdownViewer from "./pages/MarkdownViewer";
import LockScreen from "./components/LockScreen";
import BookReader from "./pages/BookReader";
import EpubReader from "./pages/EpubReader";
import EpubTest from "./pages/EpubTest";
import MinimalEpubReader from "./pages/MinimalEpubReader";
import {
  getMdFileList,
  titleToFileName,
  getAllCategoriesData,
  folderConfig,
} from "./utils/mdUtils";
import { getBookList, type Book } from "./utils/bookUtils";
import fixedSortConfig from "./config/sort-config.json";
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
  const [sortBy, setSortBy] = useState<
    "title" | "alphabetical" | "alphabetical-reverse" | "custom"
  >("title"); // 排序方式，默认使用配置文件排序
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [itemsPerPage] = useState(15); // 每页显示的文章数量

  // 电子书阅读相关状态
  const [books, setBooks] = useState<Book[]>([]); // 书籍列表

  // 日期时间状态
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // 加载书籍数据
  useEffect(() => {
    const loadBooks = () => {
      try {
        const bookList = getBookList();
        console.log("App.tsx: 加载到的书籍数据:", bookList);
        console.log("App.tsx: 书籍数量:", bookList.length);
        setBooks(bookList);
      } catch (error) {
        console.error("加载书籍数据失败:", error);
        setBooks([]);
      }
    };

    loadBooks();
  }, []);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化日期时间
  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const weekDay = weekDays[date.getDay()];

    return {
      date: `${year}年${month}月${day}日`,
      time: `${hours}:${minutes}:${seconds}`,
      weekDay,
    };
  };

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

    // 排序 - 默认使用配置文件中的固定排序
    if (sortBy === "title") {
      // 默认排序：使用配置文件中的固定排序
      const categoryConfig =
        fixedSortConfig[activeTab as keyof typeof fixedSortConfig];
      if (categoryConfig && Array.isArray(categoryConfig)) {
        // 创建标题到索引的映射
        const orderMap = new Map();
        categoryConfig.forEach((title, index) => {
          orderMap.set(title, index);
        });

        // 按配置顺序排序
        filteredTracks.sort((a, b) => {
          const orderA = orderMap.has(a.title)
            ? orderMap.get(a.title)
            : Infinity;
          const orderB = orderMap.has(b.title)
            ? orderMap.get(b.title)
            : Infinity;
          return orderA - orderB;
        });
      }
    } else {
      filteredTracks = [...filteredTracks].sort((a, b) => {
        if (sortBy === "alphabetical") {
          return a.title.localeCompare(b.title, "zh-CN");
        } else if (sortBy === "alphabetical-reverse") {
          return b.title.localeCompare(a.title, "zh-CN");
        }
        return 0;
      });
    }

    return filteredTracks;
  };

  // 获取当前页的文章数据
  const getCurrentPageTracks = () => {
    const filteredTracks = getFilteredTracks();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTracks.slice(startIndex, endIndex);
  };

  // 分页相关计算
  const filteredTracks = getFilteredTracks();
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const currentPageTracks = getCurrentPageTracks();

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
              <Link
                className={location.pathname === "/books" ? "active" : ""}
                to="/books"
              >
                书
              </Link>
              <Link
                className={location.pathname === "/resume" ? "active" : ""}
                to="/resume"
              >
                印记
              </Link>
            </div>
          </div>
          <div className="header-right">
            <div className="header-datetime">
              <span>{formatDateTime(currentTime).time}</span>
              <span>{formatDateTime(currentTime).date}</span>
              <span>{formatDateTime(currentTime).weekDay}</span>
            </div>
          </div>
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
              element={<MarkdownViewer filename="markdowns/印记导航" />}
            />

            {/* 书签页路由 */}
            <Route
              path="/resume"
              element={<MarkdownViewer filename="markdowns/书签" />}
            />

            {/* 电子书阅读页路由 */}
            <Route path="/books" element={<BookReader books={books} />} />

            {/* 极简EPUB阅读器测试路由 */}
            <Route
              path="/minimal-epub-reader"
              element={
                <div className="epub-test-page">
                  <h2>极简EPUB阅读器测试</h2>
                  <MinimalEpubReader />
                </div>
              }
            />

            {/* EPUB文件直接加载测试路由 */}
            <Route
              path="/epub-file-test"
              element={
                <div className="epub-test-page">
                  <h2>EPUB文件直接加载测试</h2>
                  <EpubTest />
                </div>
              }
            />

            {/* EPUB阅读器测试路由 - 使用更可靠的相对路径 */}
            <Route
              path="/epub-test"
              element={
                <div className="epub-test-page">
                  <h2>EPUB阅读器测试页面</h2>
                  <p>直接测试瓦尔登湖EPUB文件的加载情况：</p>
                  <EpubReader
                    // 使用绝对路径指向public目录下的文件
                    bookUrl="/books/随笔/瓦尔登湖/瓦尔登湖.epub"
                    bookTitle="瓦尔登湖"
                    onBack={() => window.history.back()}
                  />
                  <div
                    style={{
                      margin: "20px",
                      padding: "15px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "5px",
                    }}
                  >
                    <h4>调试信息</h4>
                    <p>
                      <strong>尝试加载的路径:</strong>{" "}
                      /books/随笔/瓦尔登湖/瓦尔登湖.epub
                    </p>
                    <p>
                      <strong>实际文件位置:</strong>{" "}
                      public/books/随笔/瓦尔登湖/瓦尔登湖.epub
                    </p>
                    <p>
                      <strong>相对URL访问测试:</strong>{" "}
                      <a
                        href="/books/随笔/瓦尔登湖/瓦尔登湖.epub"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        点击测试文件访问
                      </a>
                    </p>
                  </div>
                </div>
              }
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
                    onClick={() => {
                      setActiveTab(key);
                      setCurrentPage(1); // 切换分类时重置到第一页
                    }}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // 搜索时重置到第一页
                    }}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1); // 清除搜索时重置到第一页
                      }}
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
                      setSortBy(
                        e.target.value as
                          | "title"
                          | "alphabetical"
                          | "alphabetical-reverse"
                      )
                    }
                    className="sort-select"
                  >
                    <option value="title">默认排序</option>
                    <option value="alphabetical">按字母顺序</option>
                    <option value="alphabetical-reverse">按字母倒序</option>
                  </select>
                </div>
              </div>

              {/* 搜索结果统计 */}
              {searchQuery.trim() && (
                <div className="search-stats">
                  找到 {filteredTracks.length} 个结果
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
                ) : filteredTracks.length > 0 ? (
                  <>
                    {currentPageTracks.map((track, i) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + i;
                      return (
                        <div
                          key={`${activeTab}-${globalIndex}`}
                          className="track-row"
                        >
                          {/* 热搜排名序号 */}
                          <div className="hot-rank">
                            <span
                              className={`rank-number ${
                                globalIndex < 3 ? "top-rank" : ""
                              }`}
                            >
                              {globalIndex + 1}
                            </span>
                          </div>

                          {/* 文章标题 */}
                          <Link
                            to={`/song/${getMarkdownFilename(track.title)}`}
                            className="track-title"
                          >
                            {track.title}
                          </Link>

                          {/* 分类标签 - 热搜风格 */}
                          <div className="track-meta">
                            <span className={`hot-tag ${track.folderKey}`}>
                              {(track.folderKey &&
                                folderConfig[
                                  track.folderKey as keyof typeof folderConfig
                                ]?.label) ||
                                track.folderKey}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* 分页组件 */}
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          className="pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          上一页
                        </button>

                        <span className="pagination-info">
                          第 {currentPage} 页，共 {totalPages} 页
                        </span>

                        <button
                          className="pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          下一页
                        </button>
                      </div>
                    )}
                  </>
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
