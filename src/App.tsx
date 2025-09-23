import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Fireworks from "./components/Fireworks";
import TypeWriter from "./components/TypeWriter";
import MarkdownViewer from "./pages/MarkdownViewer";
import { useState } from "react";

function App() {
  const location = useLocation();
  const [fireworksOn, setFireworksOn] = useState(false);
  const musicTracks = [
    { title: "Cagayake", plays: "34653", comments: "0" },
    { title: "Dont stop believin", plays: "28778", comments: "0" },
    { title: "Fuwa Fuwa Time", plays: "19871", comments: "0" },
    { title: "Fude Pen ~Ball Pen~", plays: "7798", comments: "0" },
    { title: "Girly Storm 疾走 Stick", plays: "6314", comments: "0" },
    { title: "Gohan wa Okazu", plays: "5906", comments: "0" },
    { title: "Honey sweet tea time", plays: "4362", comments: "0" },
    { title: "Listen!!", plays: "1308", comments: "0" },
  ];

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
    return title
      .replace(/\s+/g, "-")
      .replace(/[~!]/g, "")
      .replace(/'/g, "")
      .replace(/\s*-\s*/g, "-");
  };

  const isHome = location.pathname === "/" || location.pathname === "/home";
  // 统一外链格式：去掉首尾反引号/空格，若无协议则自动补 https://
  const toUrl = (url: string) => {
    if (!url) return "#";
    const trimmed = url.trim().replace(/^`|`$/g, "");
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  return (
    <div className="app">
      {/* Fireworks canvas */}
      <Fireworks enabled={fireworksOn} />
      {/* Page header maroon area */}
      <header className="page-header">
        <div className="container header-inner">
          <div className="header-left">
            <h1 className="site-title">
              <TypeWriter text="热爱可抵岁月漫长~" />
            </h1>
            <div className="subnav">
              <Link className={isHome ? "active" : ""} to="/">
                「荒诞故事」
              </Link>
              <Link className={!isHome ? "active" : ""} to="/projects">
                印记
              </Link>
              <Link className={!isHome ? "active" : ""} to="/projects">
                奔走
              </Link>
              <Link className={!isHome ? "active" : ""} to="/projects">
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
              <span className="label">
                {fireworksOn ? "点我关闭烟花" : "点我开启烟花"}
              </span>
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
                  {/* 公告板（主页） */}
                  <section className="card notice-card">
                    <div className="notice-box">
                      <p>我的音乐在豆瓣上的所有作品都是免费的。</p>
                      <p>
                        我是一个音乐人，我的音乐风格比较多样化，主要以流行、摇滚、民谣为主。
                        我的音乐作品都是原创的，希望大家能够喜欢。
                        我会不定期的发布新的音乐作品，敬请期待。
                      </p>
                      <p>
                        如果你喜欢我的音乐，可以关注我的豆瓣音乐人主页，
                        也可以在各大音乐平台搜索我的名字。 谢谢大家的支持！
                      </p>
                      <p>联系方式：邮箱</p>
                    </div>
                  </section>

                  <section className="card music-card">
                    <div className="section-header">
                      <h2>「更新中」</h2>
                    </div>
                    <div className="music-table">
                      <div className="table-header">
                        <span className="col-title">歌曲名</span>
                        <span className="col-plays">播放数</span>
                      </div>
                      {musicTracks.map((track, i) => (
                        <div key={i} className="track-row">
                          <Link
                            to={`/song/${getMarkdownFilename(track.title)}`}
                            className="track-title"
                          >
                            {track.title}
                          </Link>
                          <span className="track-plays">{track.plays}</span>
                        </div>
                      ))}
                    </div>
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
      </div>
    </div>
  );
}

export default App;
