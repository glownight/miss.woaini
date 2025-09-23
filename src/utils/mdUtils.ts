// 动态获取所有MD文件的工具函数
export const getMdFileList = () => {
  // 使用 import.meta.glob 来动态导入所有MD文件
  const mdFiles = import.meta.glob('../datas/mds/*.md', { eager: false });
  
  const fileList = Object.keys(mdFiles).map(path => {
    // 从路径中提取文件名（不包含扩展名）
    const fileName = path.replace('../datas/mds/', '').replace('.md', '');
    
    // 处理文件名，将其转换为显示标题
    const title = formatFileName(fileName);
    
    // 生成一个随机的播放数（模拟数据）
    const plays = Math.floor(Math.random() * 50000) + 1000;
    
    return {
      title,
      fileName,
      plays: plays.toString(),
      comments: "0"
    };
  });
  
  // 按播放数排序（降序）
  return fileList.sort((a, b) => parseInt(b.plays) - parseInt(a.plays));
};

// 格式化文件名为显示标题
const formatFileName = (fileName: string): string => {
  // 移除文件名开头的特殊字符和emoji
  let title = fileName
    .replace(/^[🌙🎬📖📚]+\s*/, '') // 移除开头的emoji
    .replace(/^\s*/, '') // 移除开头空格
    .trim();
  
  // 如果标题太长，可以适当截取
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || fileName; // 如果处理后为空，返回原文件名
};

// 将标题转换为文件名（用于路由）
export const titleToFileName = (title: string): string => {
  // 这里需要反向查找原始文件名
  const mdFiles = import.meta.glob('../datas/mds/*.md', { eager: false });
  
  for (const path of Object.keys(mdFiles)) {
    const fileName = path.replace('../datas/mds/', '').replace('.md', '');
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