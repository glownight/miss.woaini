// 书籍工具函数
import { scanBooksDirectory } from './bookScanner';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  content: string[];
  totalPages: number;
  category: string;
  filePath: string;
  fileType: string;
  format?: 'epub' | 'txt' | 'pdf' | 'azw3' | 'mobi';
  epubUrl?: string;
}

// 获取书籍列表
const getBookList = (): Book[] => {
  // 使用真实的书籍扫描器
  const books = scanBooksDirectory();

  // 如果没有扫描到书籍，使用备用数据
  if (books.length === 0) {
    console.log('bookUtils: 使用备用书籍数据');
    return [
      {
        id: 'walden-epub',
        title: '瓦尔登湖',
        author: '亨利·戴维·梭罗',
        cover: '/api/placeholder/200/300',
        content: generateBookContent('瓦尔登湖', 100),
        totalPages: 100,
        category: '随笔',
        filePath: '/src/datas/books/随笔/瓦尔登湖/瓦尔登湖.epub',
        fileType: 'epub',
        format: 'epub',
        epubUrl: '/src/datas/books/随笔/瓦尔登湖/瓦尔登湖.epub'
      }
    ];
  }

  console.log('bookUtils: 生成的书籍数据:', books);
  console.log('bookUtils: 瓦尔登湖内容长度:', books[0].content.length);
  console.log('bookUtils: 瓦尔登湖第一页内容:', books[0].content[0]);

  return books;
};

// 生成书籍内容（模拟函数）
const generateBookContent = (title: string, pageCount: number): string[] => {
  const content: string[] = [];

  // 为瓦尔登湖生成真实的内容样本
  const sampleContent = `我在波地上种了大概两英亩半菜豆，由于那块地是十五年前才开垦的，我算在里面挖出两三车的树根，所以我并没有给它施肥；但在夏天时，我在锄土的过程中翻起过几车前辈，看来在这里居住过，种植过玉米和豆子，所以从某种程度上来说，土壤里的养分曾被我种的这种作物消耗殆尽。

在主要阿或者岩石植物未经过这路、太阳还没有从深树林背后升起，而所有的露珠还在叶子上闪烁的时候，我开始锄草或者由田里那些蔬菜，用泥土盖住它们的头部。——我建议你尽量避免未消就把所有这些事情做完。每天清晨，我就是在田里劳动，在湖滨而软软的沙地上踩来踩去，感觉像是型木家般轻盈，但当到太阳出来，我的脚就变得沉重起来。

我很清楚地记得，在我四岁那年，父母带着我从土顿回到这个故乡，当时首都过这些树林，这块田地和这个湖。今晚，我的苗就在这片水面上同样，我是在这里中最大近的景象。今晚，我的苗就在这片水面上同样，立着；也有些已经倒下，我算用它们的树根来做饭；到处都有新的树苗正在生长，不知道会有哪个夏天有见这新的风景。草原上摆的金丝雀也许徘徊时的模样，大概是当年那些最来的鸟；许多年过去了，我终于手持锄头的多中景象，这些豆叶、玉米叶的玉米叶和土豆的膜袋便是我在这里出现和消失的结果。

我很清楚是地记得，在我四岁那年，父母带着我从土顿回到这个故乡，当时首都过这些树林，这块田地和这个湖。今晚，我的苗就在这片水面上同样，我是在这里中最大近的景象。今晚，我的苗就在这片水面上同样，立着；也有些已经倒下，我算用它们的树根来做饭；到处都有新的树苗正在生长，不知道会有哪个夏天有见这新的风景。草原上摆的金丝雀也许徘徊时的模样，大概是当年那些最来的鸟；许多年过去了，我终于手持锄头的多中景象，这些豆叶、玉米叶的玉米叶和土豆的膜袋便是我在这里出现和消失的结果。

因为不住在古德里安学的个子，他算第15岁的微化为"古教授"了。

"叙叙很长得还是不像啊！"古德里安教授叙叙教授。

这次到到叙叙教授了，这古德里安教授虽然大概大情况铁路，不过看起来有点高兴。

叶胜在后面听了古德里安教授的话子，三个人坐在车子对面。

"甲里奖金，"古德里安教授左右又手才，目光始终落在聪明主身上，`;

  for (let i = 1; i <= pageCount; i++) {
    // 将长文本分割成段落，每页包含多个段落
    const paragraphs = sampleContent.split('\n\n').filter(p => p.trim());
    const startIndex = (i - 1) * 2 % paragraphs.length;
    const pageContent = paragraphs.slice(startIndex, startIndex + 4).join('\n\n');
    content.push(pageContent || `${title} - 第${i}页内容...`);
  }
  return content;
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