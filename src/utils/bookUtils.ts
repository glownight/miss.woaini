// 书籍工具函数
import { scanBooksDirectory } from './bookScanner';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  format: 'epub' | 'azw3' | 'mobi';
  epubUrl: string;
}

// 获取书籍列表
const getBookList = (): Book[] => {
  // 使用真实的书籍扫描器
  const books = scanBooksDirectory();

  // 如果没有扫描到书籍，使用备用数据
  if (books.length === 0) {
    return [
      {
        id: 'walden-epub',
        title: '瓦尔登湖',
        author: '亨利·戴维·梭罗',
        category: '随笔',
        format: 'epub',
        epubUrl: '/books/随笔/瓦尔登湖/瓦尔登湖.epub'
      }
    ];
  }

  return books;
};

// 根据分类获取书籍
const getBooksByCategory = (category: string): Book[] => {
  const allBooks = getBookList();
  if (category === 'all') {
    return allBooks;
  }
  return allBooks.filter(book => book.category === category);
};

// 搜索书籍
const searchBooks = (query: string): Book[] => {
  const allBooks = getBookList();
  const lowerQuery = query.toLowerCase();
  return allBooks.filter(book =>
    book.title.toLowerCase().includes(lowerQuery) ||
    book.author.toLowerCase().includes(lowerQuery) ||
    book.category.toLowerCase().includes(lowerQuery)
  );
};

// 获取所有分类
const getAllCategories = (): string[] => {
  const allBooks = getBookList();
  const categories = Array.from(new Set(allBooks.map(book => book.category)));
  return ['all', ...categories];
};

// 根据ID获取书籍
const getBookById = (id: string): Book | undefined => {
  const allBooks = getBookList();
  return allBooks.find(book => book.id === id);
};

export {
  getBookList,
  getBooksByCategory,
  searchBooks,
  getAllCategories,
  getBookById
};

export type { Book };