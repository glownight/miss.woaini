import React, { useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import "./EpubReader.css";
import { AnimatePresence, motion } from "framer-motion";

interface EpubReaderProps {
  bookUrl: string;
  bookTitle: string;
  onBack: () => void;
}

const EpubReader: React.FC<EpubReaderProps> = ({ bookUrl, bookTitle }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLightsOff, setIsLightsOff] = useState(false);

  // 新增阅读设置状态
  const [lineHeight, setLineHeight] = useState(1.9);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontFamily, setFontFamily] = useState(
    "'XiaLu-WenKai', 'KaiTi', cursive"
  );
  const [showFontPanel, setShowFontPanel] = useState(false);

  // 保存rendition引用以便动态更新样式
  const [rendition, setRendition] = useState<any>(null);

  // 目录和章节进度相关状态
  const [toc, setToc] = useState<any[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [showToc, setShowToc] = useState<boolean>(false); // 控制目录面板显示

  // 电子书真实页码相关状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 搜索相关状态
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentHighlights, setCurrentHighlights] = useState<any[]>([]); // 保存当前高亮

  // 翻页功能
  const handlePreviousPage = () => {
    console.log("🔙 handlePreviousPage 被调用");
    console.log("📖 rendition 存在?", !!rendition);
    if (rendition) {
      console.log("✅ 执行 rendition.prev()");
      clearHighlights(); // 翻页时清除高亮
      rendition.prev();
    } else {
      console.warn("❌ rendition 不存在，无法翻页");
    }
  };

  const handleNextPage = () => {
    console.log("🔜 handleNextPage 被调用");
    console.log("📖 rendition 存在?", !!rendition);
    if (rendition) {
      console.log("✅ 执行 rendition.next()");
      clearHighlights(); // 翻页时清除高亮
      rendition.next();
    } else {
      console.warn("❌ rendition 不存在，无法翻页");
    }
  };

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

  // 处理目录变化
  const handleTocChange = (tocData: any[]) => {
    // 扁平化目录，处理嵌套的子章节
    const flattenToc = (items: any[]): any[] => {
      let result: any[] = [];
      items.forEach((item) => {
        result.push(item);
        if (item.subitems && item.subitems.length > 0) {
          result = result.concat(flattenToc(item.subitems));
        }
      });
      return result;
    };

    const flatToc = flattenToc(tocData);
    setToc(flatToc);
    console.log("扁平化目录:", flatToc);
  };

  // 根据当前位置计算章节和页码
  const updateCurrentChapter = () => {
    if (!rendition || toc.length === 0) return;

    try {
      // 获取当前位置对应的章节和页码
      const currentLocation = rendition.currentLocation();
      if (currentLocation && currentLocation.start) {
        const currentHref = currentLocation.start.href;

        // 更新页码信息
        if (currentLocation.start && currentLocation.start.displayed) {
          const displayed = currentLocation.start.displayed;
          setCurrentPage(displayed.page || 1);
          setTotalPages(displayed.total || 0);
        }

        // 清理 href，移除查询参数和锚点
        const cleanHref = (href: string) => {
          if (!href) return "";
          return href.split("?")[0].split("#")[0];
        };

        const cleanedCurrentHref = cleanHref(currentHref);

        // 在目录中查找当前章节（从后往前找，找到最后一个匹配的）
        let chapterIndex = -1;
        let chapterTitle = "";

        for (let i = toc.length - 1; i >= 0; i--) {
          const tocHref = cleanHref(toc[i].href);

          // 尝试多种匹配方式
          if (
            cleanedCurrentHref === tocHref || // 完全匹配
            cleanedCurrentHref.endsWith(tocHref) || // 当前href包含toc的href
            tocHref.endsWith(cleanedCurrentHref) || // toc的href包含当前href
            cleanedCurrentHref.includes(tocHref) // 部分匹配
          ) {
            chapterIndex = i;
            chapterTitle = toc[i].label;
            break;
          }
        }

        // 如果还是没找到，尝试更宽松的匹配
        if (chapterIndex === -1) {
          const currentFileName = cleanedCurrentHref.split("/").pop() || "";

          for (let i = toc.length - 1; i >= 0; i--) {
            const tocFileName = cleanHref(toc[i].href).split("/").pop() || "";
            if (
              currentFileName &&
              tocFileName &&
              currentFileName === tocFileName
            ) {
              chapterIndex = i;
              chapterTitle = toc[i].label;
              break;
            }
          }
        }

        // 如果还是没找到，使用第一章
        if (chapterIndex === -1 && toc.length > 0) {
          chapterIndex = 0;
          chapterTitle = toc[0].label;
        }

        setCurrentChapterIndex(chapterIndex + 1); // 从1开始计数
        setCurrentChapter(chapterTitle);

        console.log(
          "当前位置:",
          cleanedCurrentHref,
          "匹配章节:",
          chapterTitle,
          `(${chapterIndex + 1}/${toc.length})`
        );
      }
    } catch (error) {
      console.error("更新章节信息失败:", error);
    }
  };

  // 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem(`searchHistory_${bookTitle}`);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("加载搜索历史失败:", error);
      }
    }
  }, [bookTitle]);

  // 保存搜索历史
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [
      query,
      ...searchHistory.filter((h) => h !== query),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(
      `searchHistory_${bookTitle}`,
      JSON.stringify(newHistory)
    );
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`searchHistory_${bookTitle}`);
  };

  // 执行搜索
  const handleSearch = async (query: string) => {
    if (!query.trim() || !rendition) return;

    // 清除旧的高亮
    clearHighlights();

    setIsSearching(true);
    setSearchResults([]);

    try {
      const book = rendition.book;
      const searchPromises: Promise<any[]>[] = [];

      // 遍历所有spine items并创建搜索Promise
      book.spine.each((item: any) => {
        const promise = new Promise<any[]>((resolve) => {
          item
            .load(book.load.bind(book))
            .then((doc: any) => {
              try {
                // 获取文本内容
                const content = doc.body
                  ? doc.body.textContent
                  : doc.textContent || "";

                if (!content) {
                  resolve([]);
                  return;
                }

                // 清理空白字符
                const cleanContent = content.replace(/\s+/g, " ").trim();

                // 在内容中查找匹配项
                const regex = new RegExp(
                  query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                  "gi"
                );
                const matches: any[] = [];
                let match;

                while ((match = regex.exec(cleanContent)) !== null) {
                  const start = Math.max(0, match.index - 40);
                  const end = Math.min(
                    cleanContent.length,
                    match.index + query.length + 40
                  );
                  let excerpt = cleanContent.substring(start, end);

                  // 添加省略号
                  if (start > 0) excerpt = "..." + excerpt;
                  if (end < cleanContent.length) excerpt = excerpt + "...";

                  // 查找对应的章节标题
                  let chapterTitle = "";
                  for (let i = toc.length - 1; i >= 0; i--) {
                    if (item.href && item.href.includes(toc[i].href)) {
                      chapterTitle = toc[i].label || "";
                      break;
                    }
                  }

                  // 尝试生成更精确的 CFI（指向具体文本位置）
                  // 使用 spineItem 和相对位置
                  const exactCfi = `${item.cfiBase}!/4/2[${
                    item.idref
                  }]!/${Math.floor(match.index / 100)}`;

                  matches.push({
                    cfi: exactCfi,
                    baseCfi: item.cfiBase,
                    excerpt: excerpt.trim(),
                    href: item.href,
                    index: match.index,
                    chapterTitle: chapterTitle || "未知章节",
                    content: cleanContent, // 保存完整内容用于精确定位
                    matchText: match[0], // 保存匹配的文本
                  });

                  // 限制每个章节最多返回5个结果
                  if (matches.length >= 5) break;
                }

                // 卸载文档以释放内存
                item.unload();
                resolve(matches);
              } catch (error) {
                console.error("解析章节内容失败:", error);
                item.unload();
                resolve([]);
              }
            })
            .catch((error: Error) => {
              console.error("加载章节失败:", error);
              resolve([]);
            });
        });

        searchPromises.push(promise);
      });

      // 等待所有搜索完成
      const allResults = await Promise.all(searchPromises);
      const flatResults = allResults.flat();

      console.log(`搜索 "${query}" 找到 ${flatResults.length} 个结果`);

      setSearchResults(flatResults);
      // 保存搜索历史（无论是否找到结果）
      saveSearchHistory(query);
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 清除所有高亮
  const clearHighlights = () => {
    if (rendition) {
      currentHighlights.forEach((highlight) => {
        try {
          rendition.annotations.remove(highlight.cfiRange, "highlight");
        } catch (error) {
          console.log("移除高亮失败:", error);
        }
      });
      setCurrentHighlights([]);
    }
  };

  // 跳转到搜索结果（精确定位到文本位置）
  const jumpToSearchResult = async (result: any) => {
    if (!rendition) {
      console.warn("Rendition 未就绪");
      return;
    }

    try {
      console.log("正在跳转到:", result.chapterTitle, result);
      console.log("搜索关键词:", result.matchText);
      console.log("目标href:", result.href);

      // 清除之前的高亮
      clearHighlights();

      // 一步跳转：先在后台找到精确位置，然后直接跳转
      if (result.matchText && rendition.book) {
        // 使用 spine.get 方法直接获取目标章节
        let targetSpineItem = rendition.book.spine.get(result.href);

        if (!targetSpineItem) {
          // 如果直接获取失败，尝试遍历查找
          for (let i = 0; i < rendition.book.spine.spineItems.length; i++) {
            const item = rendition.book.spine.spineItems[i];
            // 改进匹配逻辑：处理相对路径和完整路径
            const itemHref = item.href.split("#")[0];
            const resultHref = result.href.split("#")[0];

            if (
              itemHref === resultHref ||
              itemHref.endsWith(resultHref) ||
              resultHref.endsWith(itemHref)
            ) {
              targetSpineItem = item;
              break;
            }
          }
        }

        if (targetSpineItem) {
          console.log(
            "找到目标章节，开始搜索精确位置...",
            targetSpineItem.href
          );

          // 确保章节已加载
          if (!targetSpineItem.document) {
            await targetSpineItem.load(
              rendition.book.load.bind(rendition.book)
            );
          }

          // 使用 find 方法搜索文本
          const searchResults = await targetSpineItem.find(result.matchText);
          console.log("搜索结果:", searchResults);

          if (searchResults && searchResults.length > 0) {
            // 直接跳转到精确位置（一步到位）
            const firstResult = searchResults[0];
            await rendition.display(firstResult.cfi);
            console.log("精确定位成功:", firstResult.cfi);

            // 添加高亮
            setTimeout(() => {
              const newHighlights: any[] = [];
              searchResults.forEach((searchResult: any) => {
                try {
                  rendition.annotations.add(
                    "highlight",
                    searchResult.cfi,
                    {},
                    undefined,
                    "search-highlight",
                    {
                      fill: "yellow",
                      "fill-opacity": "0.4",
                      "mix-blend-mode": "multiply",
                    }
                  );
                  newHighlights.push(searchResult);
                } catch (error) {
                  console.log("添加高亮失败:", error);
                }
              });
              setCurrentHighlights(newHighlights);
              console.log(`已高亮 ${newHighlights.length} 个匹配项`);
            }, 200);

            // 更新当前章节信息
            setTimeout(() => {
              updateCurrentChapter();
            }, 100);

            // 卸载文档以释放内存
            if (targetSpineItem.unload) {
              targetSpineItem.unload();
            }

            return; // 成功后直接返回
          } else {
            console.log("未找到匹配文本，使用降级方案");
            // 卸载文档
            if (targetSpineItem.unload) {
              targetSpineItem.unload();
            }
          }
        } else {
          console.log("无法找到目标章节，使用降级方案");
        }
      }

      // 降级方案：直接跳转到章节
      console.log("使用降级方案：跳转到章节");
      await rendition.display(result.href || result.baseCfi);
      setTimeout(() => {
        updateCurrentChapter();
      }, 100);
    } catch (error) {
      console.error("跳转失败:", error);
      try {
        await rendition.display(result.href || result.baseCfi);
        setTimeout(() => {
          updateCurrentChapter();
        }, 100);
      } catch (e) {
        console.error("降级跳转也失败:", e);
      }
    }
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

  // 一键熄灯切换
  const toggleLightsOff = () => {
    const newLightsOffState = !isLightsOff;
    setIsLightsOff(newLightsOffState);

    // 在body上添加/移除class，以便全局控制App的header和锁屏按钮
    if (newLightsOffState) {
      document.body.classList.add("reader-lights-off");
    } else {
      document.body.classList.remove("reader-lights-off");
    }
  };

  // 点击阅读区域关闭所有面板
  const handleReadingAreaClick = (e: React.MouseEvent) => {
    // 检查是否有打开的面板
    const hasOpenPanel =
      showToc || showSearchPanel || showFontPanel || showSettings;

    if (hasOpenPanel) {
      console.log("📖 阅读区域被点击，关闭所有面板");
      e.stopPropagation();
      setShowToc(false);
      setShowSearchPanel(false);
      setShowFontPanel(false);
      setShowSettings(false);
    }
  };

  // 组件卸载时清除body class
  useEffect(() => {
    return () => {
      document.body.classList.remove("reader-lights-off");
    };
  }, []);

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

  // 当目录加载完成后，更新当前章节
  useEffect(() => {
    if (rendition && toc.length > 0) {
      // 延迟执行，确保 rendition 完全就绪
      const timer = setTimeout(() => {
        updateCurrentChapter();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [rendition, toc]);

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

  // 调试：检查翻页按钮状态
  useEffect(() => {
    setTimeout(() => {
      const leftBtn = document.querySelector(
        ".epub-page-click-left"
      ) as HTMLElement;
      const rightBtn = document.querySelector(
        ".epub-page-click-right"
      ) as HTMLElement;
      const readingArea = document.querySelector(
        ".epub-reading-area"
      ) as HTMLElement;

      console.log("🔍 检查翻页按钮状态:");
      console.log("  阅读区域:", readingArea);
      console.log("  左侧按钮:", leftBtn);
      console.log("  右侧按钮:", rightBtn);

      if (readingArea) {
        const rect = readingArea.getBoundingClientRect();
        console.log("  阅读区域位置:");
        console.log("    left:", rect.left, "top:", rect.top);
        console.log("    width:", rect.width, "height:", rect.height);
      }

      if (leftBtn) {
        const styles = window.getComputedStyle(leftBtn);
        const rect = leftBtn.getBoundingClientRect();
        console.log("  左侧按钮样式:");
        console.log("    position:", styles.position);
        console.log("    display:", styles.display);
        console.log("    visibility:", styles.visibility);
        console.log("    opacity:", styles.opacity);
        console.log("    pointer-events:", styles.pointerEvents);
        console.log("    z-index:", styles.zIndex);
        console.log("    width:", styles.width);
        console.log("    height:", styles.height);
        console.log("  左侧按钮位置:");
        console.log("    left:", rect.left, "top:", rect.top);
        console.log("    width:", rect.width, "height:", rect.height);
      }

      if (rightBtn) {
        const styles = window.getComputedStyle(rightBtn);
        const rect = rightBtn.getBoundingClientRect();
        console.log("  右侧按钮样式:");
        console.log("    position:", styles.position);
        console.log("    display:", styles.display);
        console.log("    visibility:", styles.visibility);
        console.log("    opacity:", styles.opacity);
        console.log("    pointer-events:", styles.pointerEvents);
        console.log("    z-index:", styles.zIndex);
        console.log("    width:", styles.width);
        console.log("    height:", styles.height);
        console.log("  右侧按钮位置:");
        console.log("    left:", rect.left, "top:", rect.top);
        console.log("    width:", rect.width, "height:", rect.height);
      }
    }, 1000);
  }, []);

  return (
    <div
      className={`epub-reader-novel ${theme} ${
        isFullscreen ? "fullscreen-mode" : ""
      } ${isLightsOff ? "lights-off-mode" : ""}`}
    >
      {!isFullscreen && (
        <header className="reader-top-nav">
          <div className="nav-left">
            <span className="book-title-nav">《{bookTitle}》</span>
            <span className="divider">|</span>
            <span className="">{currentChapter}</span>
            <span className="">
              {currentPage} / {totalPages}
            </span>
          </div>
          <div className="nav-right">
            {/* 工具栏按钮组 */}
            <div className="nav-toolbar-buttons">
              {/* 目录 */}
              <button
                className="toolbar-btn"
                title="目录"
                onClick={() => setShowToc(!showToc)}
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
              {/* 搜索 */}
              <button
                className="toolbar-btn"
                title="搜索"
                onClick={() => setShowSearchPanel(!showSearchPanel)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* 一键熄灯 */}
              <button
                className="toolbar-btn lights-off-keeper"
                title={isLightsOff ? "开灯" : "一键熄灯"}
                onClick={toggleLightsOff}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18h6M10 21h4M12 3v1M12 5a5 5 0 0 1 5 5c0 1.5-1 2.5-1.5 3.5S15 15 15 16h-1.5-1-1H10c0-1 0-1.5-.5-2.5S8 11.5 8 10a5 5 0 0 1 4-5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={isLightsOff ? "currentColor" : "none"}
                    opacity={isLightsOff ? "1" : "0.7"}
                  />
                </svg>
              </button>

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
                  <path
                    d="M3 8h18M3 12h18M3 16h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 4v16M18 4v16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
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

            <span className="divider lights-off-hide">|</span>
            <button
              className="lights-off-hide"
              onClick={() => (window.location.href = "/books")}
            >
              我的书桌
            </button>
          </div>
        </header>
      )}

      {/* 全屏模式下的右侧垂直工具栏 */}
      {isFullscreen && (
        <aside className="right-toolbar">
          <button
            className="toolbar-btn"
            title="目录"
            onClick={() => setShowToc(!showToc)}
          >
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
        {/* 面板打开时的遮罩层 - 点击关闭所有面板 */}
        {(showToc || showSearchPanel || showFontPanel || showSettings) && (
          <div className="reading-overlay" onClick={handleReadingAreaClick} />
        )}

        {/* 左侧翻页区域 - 隐形 */}
        <button
          className="epub-page-click-area epub-page-click-left"
          onClick={(e) => {
            console.log("👆 左侧翻页按钮被点击");
            e.preventDefault();
            e.stopPropagation();
            handlePreviousPage();
          }}
          aria-label="上一页"
          type="button"
        />

        {/* 右侧翻页区域 - 隐形 */}
        <button
          className="epub-page-click-area epub-page-click-right"
          onClick={(e) => {
            console.log("👆 右侧翻页按钮被点击");
            e.preventDefault();
            e.stopPropagation();
            handleNextPage();
          }}
          aria-label="下一页"
          type="button"
        />

        <div className="epub-content">
          <ReactReader
            url={bookUrl}
            location={location}
            locationChanged={(epubcfi: string) => {
              setLocation(epubcfi);
              updateCurrentChapter();
            }}
            epubOptions={{
              flow: "paginated",
              manager: "default",
              spread: "none",
            }}
            getRendition={(rend) => {
              console.log("📚 getRendition 被调用");
              console.log("📚 rendition 对象:", rend);
              console.log(
                "📚 rendition.prev 方法存在?",
                typeof rend.prev === "function"
              );
              console.log(
                "📚 rendition.next 方法存在?",
                typeof rend.next === "function"
              );

              // 保存rendition引用
              setRendition(rend);
              console.log("✅ rendition 已保存到 state");

              // 应用字体大小
              rend.themes.fontSize(`${fontSize}px`);

              // 应用行间距
              rend.themes.override("line-height", `${lineHeight}`);

              // 应用字间距
              rend.themes.override("letter-spacing", `${letterSpacing}px`);

              // 应用字体
              rend.themes.override("font-family", fontFamily);

              // 应用主题样式（护眼配色）
              if (theme === "dark") {
                // 深色护眼模式：灰褐色文字 + 纯黑背景
                rend.themes.override("color", "#51606b"); // 灰褐色文字
                rend.themes.override("background", "#0a0a0a"); // 纯黑背景
              } else if (theme === "light") {
                rend.themes.override("color", "#333333");
                rend.themes.override("background", "#ffffff");
              } else if (theme === "sepia") {
                rend.themes.override("color", "#5c4b37");
                rend.themes.override("background", "#f4f1e8");
              }

              // 移除所有内边距，最大化显示区域
              rend.themes.override("padding", "0");
              rend.themes.override("margin", "0");

              // 监听位置变化以更新页码
              rend.on("relocated", (location: any) => {
                if (location && location.start && location.start.displayed) {
                  const displayed = location.start.displayed;
                  setCurrentPage(displayed.page || 1);
                  setTotalPages(displayed.total || 0);
                }
              });

              // 监听页面渲染，强制覆盖 Dark Reader 样式
              rend.on("rendered", () => {
                try {
                  const iframe = document.querySelector(
                    ".epub-content iframe"
                  ) as HTMLIFrameElement;
                  if (iframe && iframe.contentDocument) {
                    const iframeDoc = iframe.contentDocument;

                    // 移除已存在的覆盖样式
                    const existingStyle = iframeDoc.getElementById(
                      "force-color-override"
                    );
                    if (existingStyle) {
                      existingStyle.remove();
                    }

                    // 注入强制覆盖样式
                    const style = iframeDoc.createElement("style");
                    style.id = "force-color-override";
                    style.textContent = `
                      :root {
                        --darkreader-text-51606b: #51606b !important;
                        --darkreader-background-0a0a0a: #0a0a0a !important;
                        --darkreader-background-0d0d0d: #0a0a0a !important;
                        --darkreader-inline-color: #51606b !important;
                        --darkreader-inline-bgcolor: #0a0a0a !important;
                      }
                      * {
                        color: #51606b !important;
                        background-color: #0a0a0a !important;
                      }
                      [data-darkreader-inline-color] {
                        color: #51606b !important;
                      }
                      [data-darkreader-inline-bgcolor] {
                        background-color: #0a0a0a !important;
                      }
                    `;
                    iframeDoc.head.appendChild(style);
                  }
                } catch (error) {
                  console.log("无法注入样式:", error);
                }
              });
            }}
            tocChanged={handleTocChange}
          />
        </div>
      </div>

      {/* 目录面板 */}
      <AnimatePresence>
        {showToc && toc.length > 0 && (
          <motion.div
            className="toc-panel"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
          >
            <div className="toc-panel-header">
              <h3>目录</h3>
              <button
                onClick={() => setShowToc(false)}
                className="toc-close-btn"
              >
                ✕
              </button>
            </div>
            <div className="toc-list">
              {toc.map((item, index) => (
                <button
                  key={index}
                  className={`toc-item ${
                    index === currentChapterIndex - 1 ? "active" : ""
                  }`}
                  onClick={() => {
                    if (item.href && rendition) {
                      try {
                        // 直接使用 href 跳转
                        rendition
                          .display(item.href)
                          .then(() => {
                            // 跳转后更新当前章节
                            setTimeout(() => {
                              updateCurrentChapter();
                            }, 100);
                          })
                          .catch((error: Error) => {
                            console.error("跳转章节失败:", error);
                          });
                      } catch (error) {
                        console.error("跳转章节失败:", error);
                      }
                    }
                  }}
                >
                  <span className="toc-item-index">{index + 1}</span>
                  <span className="toc-item-title">
                    {item.label || item.title || `章节 ${index + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索面板 */}
      <AnimatePresence>
        {showSearchPanel && (
          <motion.div
            className="search-panel"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
          >
            <div className="search-panel-header">
              <h3>搜索</h3>
              <button
                onClick={() => setShowSearchPanel(false)}
                className="search-close-btn"
              >
                ✕
              </button>
            </div>

            {/* 搜索输入框 */}
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="输入关键词搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(searchQuery);
                  }
                }}
              />
              <button
                className="search-btn"
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? "搜索中..." : "搜索"}
              </button>
            </div>

            {/* 搜索历史 */}
            {searchHistory.length > 0 &&
              searchResults.length === 0 &&
              !isSearching &&
              !searchQuery && (
                <div className="search-history">
                  <div className="search-history-header">
                    <span>搜索历史</span>
                    <button
                      className="clear-history-btn"
                      onClick={clearSearchHistory}
                    >
                      清除
                    </button>
                  </div>
                  <div className="search-history-list">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        className="search-history-item"
                        onClick={() => {
                          setSearchQuery(item);
                          handleSearch(item);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  找到 {searchResults.length} 个结果
                </div>
                <div className="search-results-list">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      className="search-result-item"
                      onClick={() => jumpToSearchResult(result)}
                    >
                      {result.chapterTitle && (
                        <div className="search-result-chapter">
                          📖 {result.chapterTitle}
                        </div>
                      )}
                      <div
                        className="search-result-excerpt"
                        dangerouslySetInnerHTML={{
                          __html: result.excerpt.replace(
                            new RegExp(searchQuery, "gi"),
                            (match: string) => `<mark>${match}</mark>`
                          ),
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 加载中提示 */}
            {isSearching && (
              <div className="search-no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>正在搜索 "{searchQuery}"...</p>
              </div>
            )}

            {/* 无结果提示 */}
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="search-no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>未找到 "{searchQuery}" 的相关内容</p>
                <p
                  style={{ fontSize: "12px", opacity: 0.7, marginTop: "10px" }}
                >
                  提示：搜索功能会在所有章节中查找关键词
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EpubReader;
