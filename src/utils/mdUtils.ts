// 定义文件夹配置
export const folderConfig = {
  '最重要': { path: '../datas/最重要/*.md', label: '最重要' },
  '文摘': { path: '../datas/文摘/*.md', label: '文摘' },
  '诗歌': { path: '../datas/诗歌/*.md', label: '诗歌' },
  '处世': { path: '../datas/处世/*.md', label: '处世' },
  '演讲': { path: '../datas/演讲/*.md', label: '演讲' },
};

// 获取所有分类的数据
export const getAllCategoriesData = () => {
  const categoriesData: Record<string, any[]> = {};
  Object.entries(folderConfig).forEach(([key, config]) => {
    const data = getMdFileListByFolder(config.path, key);
    categoriesData[key] = data;
  });

  return categoriesData;
};

// 根据文件夹获取MD文件列表
export const getMdFileListByFolder = (_globPath: string, folderKey: string) => {
  const mdFiles = import.meta.glob('../datas/**/*.md', { eager: false });

  // 改进的过滤逻辑：处理中文路径和编码问题
  const folderFiles = Object.keys(mdFiles).filter(path => {
    // 使用更精确的路径匹配，确保只匹配正确的文件夹
    const folderPattern = `/datas/${folderKey}/`;
    return path.includes(folderPattern) && 
           !path.includes(`/datas/${folderKey}/其他/`) && // 避免匹配子文件夹
           path.split('/').includes(folderKey); // 确保folderKey是路径中的文件夹名
  });

  const fileList = folderFiles.map(path => {
    // 从路径中提取文件名（不包含扩展名）
    const fileName = path.split('/').pop()?.replace('.md', '') || '';

    // 处理文件名，将其转换为显示标题
    const title = formatFileName(fileName);

    // 生成一个随机的播放数（模拟数据）
    const plays = Math.floor(Math.random() * 50000) + 1000;

    return {
      title,
      fileName,
      folderKey,
      plays: plays.toString(),
      comments: "0"
    };
  });

  // 按播放数排序（降序）
  return fileList.sort((a, b) => parseInt(b.plays) - parseInt(a.plays));
};

// 动态获取所有MD文件的工具函数（兼容旧版本）
export const getMdFileList = () => {
  // 获取所有分类的数据并合并
  const allData = getAllCategoriesData();
  const combined: any[] = [];

  Object.values(allData).forEach(categoryData => {
    combined.push(...categoryData);
  });

  return combined.sort((a, b) => parseInt(b.plays) - parseInt(a.plays));
};

// 格式化文件名为显示标题
const formatFileName = (fileName: string): string => {
  // 直接返回原文件名作为标题，保持原有格式
  let title = fileName.trim();

  // 如果标题太长，可以适当截取
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }

  return title || fileName; // 如果处理后为空，返回原文件名
};

// 将标题转换为文件名（用于路由）
export const titleToFileName = (title: string): string => {
  // 搜索所有文件夹中的文件
  const mdFiles = import.meta.glob('../datas/**/*.md', { eager: false });

  for (const path of Object.keys(mdFiles)) {
    const fileName = path.split('/').pop()?.replace('.md', '') || '';
    const formattedTitle = formatFileName(fileName);

    if (formattedTitle === title) {
      return fileName;
    }
  }

  // 如果找不到匹配的，返回处理过的标题
  return title
    .replace(/\s+/g, '-')
    .replace(/[~!]/g, '')
    .replace(/'/g, '')
    .replace(/\s*-\s*/g, '-');
};

// 根据文件名获取文件的完整路径
export const getFilePathByName = (fileName: string): string => {
  const mdFiles = import.meta.glob('../datas/**/*.md', { eager: false });

  for (const path of Object.keys(mdFiles)) {
    const pathFileName = path.split('/').pop()?.replace('.md', '') || '';
    if (pathFileName === fileName) {
      // 返回相对于MarkdownViewer组件的路径
      return path.replace('../', '../');
    }
  }

  // 兼容旧路径
  return `../datas/mds/${fileName}.md`;
};