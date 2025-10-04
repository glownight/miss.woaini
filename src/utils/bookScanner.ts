// 书籍文件扫描工具
import type { Book } from './bookUtils';

// 预定义的书籍映射 - 基于实际目录结构
interface BookInfo {
  title: string;
  author: string;
  format: 'epub' | 'azw3' | 'mobi';
  path: string;
}

const BOOKS_MAPPING: Record<string, Record<string, BookInfo>> = {
  '随笔': {
    '瓦尔登湖': {
      title: '瓦尔登湖',
      author: '亨利·戴维·梭罗',
      format: 'epub',
      path: '/src/datas/books/随笔/瓦尔登湖/瓦尔登湖.epub'
    }
  },
  '文学': {
    '莎士比亚': {
      title: '莎士比亚全集',
      author: '威廉·莎士比亚',
      format: 'epub',
      path: '/src/datas/books/文学/莎士比亚.epub'
    }
  },
  '诗歌': {
    // 诗歌分类暂时为空，可以后续添加
  }
};

// 扫描书籍目录结构
const scanBooksDirectory = (): Book[] => {
  const books: Book[] = [];

  // 遍历所有分类
  Object.entries(BOOKS_MAPPING).forEach(([category, categoryBooks]) => {
    Object.entries(categoryBooks).forEach(([bookName, bookInfo]) => {
      // 生成唯一的ID
      const bookId = `${category}-${bookName.replace(/\s+/g, '-').toLowerCase()}`;
      
      books.push({
        id: bookId,
        title: bookInfo.title,
        author: bookInfo.author,
        category: category,
        format: bookInfo.format,
        epubUrl: bookInfo.path
      });
    });
  });

  return books;
};

// 扫描特定分类的书籍
const scanCategory = (category: string): Book[] => {
  const books: Book[] = [];
  const categoryBooks = BOOKS_MAPPING[category as keyof typeof BOOKS_MAPPING];

  if (categoryBooks) {
    Object.entries(categoryBooks).forEach(([bookName, bookInfo]) => {
      const bookId = `${category}-${bookName.replace(/\s+/g, '-').toLowerCase()}`;
      
      books.push({
        id: bookId,
        title: bookInfo.title,
        author: bookInfo.author,
        category: category,
        format: bookInfo.format,
        epubUrl: bookInfo.path
      });
    });
  }

  return books;
};

// 获取所有可用的分类
const getAvailableCategories = (): string[] => {
  return Object.keys(BOOKS_MAPPING).filter(category => 
    Object.keys(BOOKS_MAPPING[category as keyof typeof BOOKS_MAPPING]).length > 0
  );
};

// 检查书籍文件是否存在（模拟检查）
const checkBookExists = (): boolean => {
  // 在实际应用中，这里应该检查文件是否存在
  // 由于浏览器限制，我们假设所有预定义的书籍都存在
  return true;
};

export { scanBooksDirectory, scanCategory, getAvailableCategories, checkBookExists };
