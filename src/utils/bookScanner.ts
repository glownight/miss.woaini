// 书籍文件扫描工具
import type { Book } from './bookUtils';

// 扫描书籍目录结构
const scanBooksDirectory = (): Book[] => {
  const books: Book[] = [];

  // 扫描随笔分类
  const essayBooks = scanCategory('随笔');
  books.push(...essayBooks);

  // 扫描诗歌分类
  const poetryBooks = scanCategory('诗歌');
  books.push(...poetryBooks);


  return books;
};

// 扫描特定分类的书籍
const scanCategory = (category: string): Book[] => {
  const books: Book[] = [];

  // 这里应该实现真实的文件系统扫描
  // 由于浏览器环境限制，我们使用预定义的映射

  if (category === '随笔') {
    // 添加epub格式的瓦尔登湖
    books.push({
      id: 'walden-epub',
      title: '瓦尔登湖',
      author: '亨利·戴维·梭罗',
      category: '随笔',
      format: 'epub',
      epubUrl: '/books/随笔/瓦尔登湖/瓦尔登湖.epub'
    });
  }

  return books;
};

export { scanBooksDirectory };
