import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBookList, getAllCategories, type Book } from "../utils/bookUtils";
import EpubReader from "./EpubReader";
import "./BookReader.css";

interface BookReaderProps {
  books: Book[];
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  books,
  currentBook,
  setCurrentBook,
  currentPage,
  setCurrentPage,
  fontSize,
  setFontSize,
  theme,
  setTheme,
}) => {
  const [showLibrary, setShowLibrary] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [showEpubReader, setShowEpubReader] = useState(false);
  const [selectedEpubBook, setSelectedEpubBook] = useState<Book | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 新增阅读设置状态
  const [fontFamily, setFontFamily] = useState("inherit");
  const [lineHeight, setLineHeight] = useState(1.9);
  const [paragraphSpacing, setParagraphSpacing] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);

  // 初始化书籍数据
  useEffect(() => {
    const loadBooks = () => {
      const bookList = getBookList();
      console.log("BookReader: 内部加载的书籍数据:", bookList);
      setAvailableBooks(bookList);
    };

    loadBooks();
  }, []);

  // 过滤书籍 - 优先使用props中的books，如果没有则使用availableBooks
  const booksToDisplay = books.length > 0 ? books : availableBooks;
  console.log("BookReader: props中的books:", books);
  console.log("BookReader: 内部availableBooks:", availableBooks);
  console.log("BookReader: 最终使用的booksToDisplay:", booksToDisplay);

  const filteredBooks = booksToDisplay.filter((book) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  console.log("BookReader: 过滤后的书籍:", filteredBooks);

  const categories = getAllCategories();

  const handleBookSelect = (book: Book) => {
    console.log("BookReader: 选择的书籍:", book);
    console.log("BookReader: 书籍内容长度:", book.content.length);
    console.log("BookReader: 第一页内容:", book.content[0]);

    // 检查是否为EPUB格式
    if (book.format === "epub" && book.epubUrl) {
      console.log("BookReader: 检测到EPUB格式，准备打开EPUB阅读器");
      console.log("BookReader: epubUrl:", book.epubUrl);

      // 验证URL格式
      try {
        const url = new URL(book.epubUrl, window.location.origin);
        console.log("BookReader: 验证后的URL:", url.href);
        setSelectedEpubBook(book);
        setShowEpubReader(true);
        console.log("BookReader: EPUB阅读器状态已设置");
      } catch (error) {
        console.error("BookReader: URL验证失败:", error);
        // 如果URL无效，尝试直接设置为相对路径
        setSelectedEpubBook({
          ...book,
          epubUrl: book.epubUrl.startsWith("/")
            ? book.epubUrl
            : `/${book.epubUrl}`,
        });
        setShowEpubReader(true);
      }
    } else {
      console.log("BookReader: 非EPUB格式，使用普通阅读器");
      setCurrentBook(book);
      setCurrentPage(1);
      setShowLibrary(false);
    }
  };

  const handleBackFromEpub = () => {
    setShowEpubReader(false);
    setSelectedEpubBook(null);
  };

  const handleBackToLibrary = () => {
    setCurrentBook(null);
    setShowLibrary(true);
  };

  const handlePreviousPage = () => {
    if (currentBook && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentBook && currentPage < currentBook.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(Math.max(12, Math.min(24, size)));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // 全屏切换功能
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("无法进入全屏模式:", err);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
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

  // 全屏模式下的键盘快捷键
  useEffect(() => {
    if (!isFullscreen || !currentBook) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // 左箭头或 PageUp - 上一页
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
      // 右箭头或 PageDown 或 空格 - 下一页
      else if (
        e.key === "ArrowRight" ||
        e.key === "PageDown" ||
        e.key === " "
      ) {
        e.preventDefault();
        if (currentPage < currentBook.totalPages) {
          setCurrentPage(currentPage + 1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFullscreen, currentBook, currentPage, setCurrentPage]);

  // EPUB阅读器模式
  if (showEpubReader && selectedEpubBook) {
    console.log("BookReader: 渲染EPUB阅读器模式");
    console.log("BookReader: showEpubReader:", showEpubReader);
    console.log("BookReader: selectedEpubBook:", selectedEpubBook);
    return (
      <EpubReader
        bookUrl={selectedEpubBook.epubUrl!}
        bookTitle={selectedEpubBook.title}
        onBack={handleBackFromEpub}
      />
    );
  }

  // 普通阅读器模式
  if (!showLibrary && currentBook) {
    return (
      <div
        className={`book-reader-novel ${theme} ${
          isFullscreen ? "fullscreen-mode" : ""
        }`}
      >
        {/* 顶部导航栏 - 非全屏时显示 */}
        {!isFullscreen && (
          <header className="reader-top-nav">
            <div className="nav-left">
              <svg
                className="book-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span className="book-title-nav">{currentBook.title}</span>
              <svg
                className="mail-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="nav-right">
              {/* 工具栏按钮组 */}
              <div className="nav-toolbar-buttons">
                {/* 字体大小 */}
                <button
                  className="toolbar-btn"
                  title="减小字号"
                  onClick={() => handleFontSizeChange(fontSize - 1)}
                >
                  <span className="font-text" style={{ fontSize: "11px" }}>
                    A-
                  </span>
                </button>
                <button
                  className="toolbar-btn"
                  title="增大字号"
                  onClick={() => handleFontSizeChange(fontSize + 1)}
                >
                  <span className="font-text" style={{ fontSize: "13px" }}>
                    A+
                  </span>
                </button>

                {/* 字体类型 */}
                <button
                  className="toolbar-btn"
                  title="字体类型"
                  onClick={() => setShowSettings(!showSettings)}
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

                {/* 段间距 */}
                <button
                  className="toolbar-btn"
                  title="段间距"
                  onClick={() =>
                    setParagraphSpacing(
                      paragraphSpacing === 1.5
                        ? 2
                        : paragraphSpacing === 2
                        ? 1
                        : 1.5
                    )
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line
                      x1="3"
                      y1="4"
                      x2="21"
                      y2="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="3"
                      y1="8"
                      x2="21"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="3"
                      y1="14"
                      x2="21"
                      y2="14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="3"
                      y1="20"
                      x2="21"
                      y2="20"
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
                    handleThemeChange(
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
            <button
              className="toolbar-btn"
              title="设置"
              onClick={() => setShowSettings(!showSettings)}
            >
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

        {/* 设置面板 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="settings-panel-novel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="setting-group">
                <label>字体类型</label>
                <div className="font-family-buttons">
                  <button
                    className={fontFamily === "inherit" ? "active" : ""}
                    onClick={() => setFontFamily("inherit")}
                  >
                    默认
                  </button>
                  <button
                    className={fontFamily === "serif" ? "active" : ""}
                    onClick={() => setFontFamily("serif")}
                    style={{ fontFamily: "serif" }}
                  >
                    宋体
                  </button>
                  <button
                    className={fontFamily === "sans-serif" ? "active" : ""}
                    onClick={() => setFontFamily("sans-serif")}
                    style={{ fontFamily: "sans-serif" }}
                  >
                    黑体
                  </button>
                  <button
                    className={fontFamily === "cursive" ? "active" : ""}
                    onClick={() => setFontFamily("cursive")}
                    style={{ fontFamily: "cursive" }}
                  >
                    楷体
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>字体大小</label>
                <div className="font-size-controls">
                  <button onClick={() => handleFontSizeChange(fontSize - 2)}>
                    A-
                  </button>
                  <span>{fontSize}px</span>
                  <button onClick={() => handleFontSizeChange(fontSize + 2)}>
                    A+
                  </button>
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
                <label>段间距: {paragraphSpacing.toFixed(1)}em</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={paragraphSpacing}
                  onChange={(e) =>
                    setParagraphSpacing(parseFloat(e.target.value))
                  }
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
                    onClick={() => handleThemeChange("light")}
                  >
                    浅色
                  </button>
                  <button
                    className={theme === "dark" ? "active" : ""}
                    onClick={() => handleThemeChange("dark")}
                  >
                    深色
                  </button>
                  <button
                    className={theme === "sepia" ? "active" : ""}
                    onClick={() => handleThemeChange("sepia")}
                  >
                    护眼
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主阅读区域 */}
        <main className="reading-area">
          {/* 章节标题 */}
          <div className="chapter-title">上堂亲之门({currentPage})</div>

          {/* 双栏内容 */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="reading-columns"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              lineHeight: lineHeight,
              letterSpacing: `${letterSpacing}px`,
            }}
          >
            {(() => {
              if (!currentBook.content || currentBook.content.length === 0) {
                return <div className="error-message">书籍内容为空</div>;
              }

              if (
                currentPage - 1 < 0 ||
                currentPage - 1 >= currentBook.content.length
              ) {
                return <div className="error-message">页码超出范围</div>;
              }

              const pageContent = currentBook.content[currentPage - 1];
              const paragraphs = pageContent
                .split("\n\n")
                .filter((p) => p.trim());
              const midPoint = Math.ceil(paragraphs.length / 2);
              const leftColumn = paragraphs.slice(0, midPoint);
              const rightColumn = paragraphs.slice(midPoint);

              return (
                <>
                  <div className="column-left">
                    {leftColumn.map((paragraph, index) => (
                      <p
                        key={`left-${index}`}
                        style={{ marginBottom: `${paragraphSpacing}em` }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="column-right">
                    {rightColumn.map((paragraph, index) => (
                      <p
                        key={`right-${index}`}
                        style={{ marginBottom: `${paragraphSpacing}em` }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </main>

        {/* 底部翻页控制 - 非全屏时显示 */}
        {!isFullscreen && (
          <footer className="reader-footer">
            <button
              className="page-nav-btn"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              &lt; 上一页
            </button>
            <button
              className="page-nav-btn"
              onClick={handleNextPage}
              disabled={currentPage >= currentBook.totalPages}
            >
              下一页 &gt;
            </button>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div className="book-library">
      {/* 书架头部 */}
      <div className="library-header">
        <div className="search-controls">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              type="text"
              placeholder="搜索书籍或作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "全部分类" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 书籍表格 */}
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5A2.5 2.5 0 016.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <h3>未找到相关书籍</h3>
          <p>尝试调整搜索条件或分类筛选</p>
        </div>
      ) : (
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th className="col-index">序号</th>
                <th className="col-title">书名</th>
                <th className="col-author">作者</th>
                <th className="col-category">分类</th>
                <th className="col-format">格式</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book, index) => (
                <motion.tr
                  key={book.id}
                  className="book-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(139, 115, 85, 0.08)" }}
                  onClick={() => handleBookSelect(book)}
                >
                  <td className="col-index">{index + 1}</td>
                  <td className="col-title">
                    <div className="title-wrapper">
                      <span className="book-icon-mini">📖</span>
                      {book.title}
                    </div>
                  </td>
                  <td className="col-author">{book.author}</td>
                  <td className="col-category">
                    <span className="category-badge">{book.category}</span>
                  </td>
                  <td className="col-format">
                    <span className={`format-badge format-${book.format}`}>
                      {book.format?.toUpperCase() || "TXT"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookReader;
