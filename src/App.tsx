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

  // 检查解锁令牌
  useEffect(() => {
    const unlockToken = sessionStorage.getItem('unlockToken');
    if (unlockToken) {
      try {
        const decoded = atob(unlockToken);
        if (decoded.startsWith('unlocked_')) {
          const timestamp = parseInt(decoded.split('_')[1]);
          // 令牌有效期为1小时
          if (Date.now() - timestamp < 3600000) {
            setIsLocked(false);
          } else {
            sessionStorage.removeItem('unlockToken');
          }
        }
      } catch (error) {
        sessionStorage.removeItem('unlockToken');
      }
    }
  }, []);

  // 动态加载MD文件列表
  useEffect(() => {
    const allCategories = getAllCategoriesData();
    setCategoriesData(allCategories);

    // 合并所有数据作为默认显示
    const tracks = getMdFileList();
    setMusicTracks(tracks);
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

  // 根据tab筛选数据
  const getFilteredTracks = () => {
    if (activeTab === "all") {
      return musicTracks;
    }
    // 根据文件夹进行筛选
    if (activeTab in categoriesData) {
      return categoriesData[activeTab] || [];
    }
    return musicTracks;
  };

  // 如果处于锁屏状态，显示锁屏界面
  if (isLocked) {
    return (
      <LockScreen 
        onUnlock={() => setIsLocked(false)}
      />
    );
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
        🔒 锁屏
      </motion.button>
      
      {/* Page header maroon area */}
      <header className="page-header">
        <div className="container header-inner">
          <div className="header-left">
            <h1 className="site-title">
              {/* <TypeWriter text="热爱可抵岁月漫长~" /> */}
            </h1>
            <div className="subnav">
              <Link className={isHome ? "active" : ""} to="/">
                「荒诞故事」
              </Link>
              <Link className={!isHome ? "active" : ""} to="">
                印记
              </Link>
              <Link className={!isHome ? "active" : ""} to="">
                奔走
              </Link>
              <Link className={!isHome ? "active" : ""} to="">
                多言
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

            {/* 兼容 /home 与未知路由 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Right sidebar with tabs - 始终显示 */}
        <aside className="sidebar-right">
          <div className="card tab-card">
            <div className="tab-header">
              {Object.entries(folderConfig).map(([key, config]) => (
                <button
                  key={key}
                  className={`tab-btn ${activeTab === key ? "active" : ""}`}
                  onClick={() => setActiveTab(key)}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* 文章列表显示在右侧 - 只在选择了具体分类后显示 */}
          {activeTab !== "all" && (
            <div className="card music-card">
              <div className="section-header">
                <h2>
                  「
                  {folderConfig[activeTab as keyof typeof folderConfig]
                    ?.label || activeTab}
                  」
                </h2>
              </div>
              <div className="music-table">
                {getFilteredTracks().map((track, i) => (
                  <div key={`${activeTab}-${i}`} className="track-row">
                    <Link
                      to={`/song/${getMarkdownFilename(track.title)}`}
                      className="track-title"
                    >
                      {track.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
