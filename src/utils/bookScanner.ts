// 书籍文件扫描工具
import type { Book } from './bookUtils';

// 书籍文件扩展名
// const SUPPORTED_FORMATS = ['.epub', '.azw3', '.mobi', '.txt', '.pdf'];
// 书籍信息映射（可以根据实际文件名进行匹配）
// const BOOK_INFO_MAP: Record<string, { title: string; author: string; category: string }> = {
//   // 瓦尔登湖示例
//   '瓦尔登湖.epub': {
//     title: '瓦尔登湖',
//     author: '亨利·戴维·梭罗',
//     category: '随笔'
//   },
//   '瓦尔登湖.azw3': {
//     title: '瓦尔登湖',
//     author: '亨利·戴维·梭罗',
//     category: '随笔'
//   },
//   '瓦尔登湖.mobi': {
//     title: '瓦尔登湖',
//     author: '亨利·戴维·梭罗',
//     category: '随笔'
//   }
//   // 可以添加更多书籍信息
// };

// 扫描书籍目录结构
const scanBooksDirectory = (): Book[] => {
  const books: Book[] = [];

  // 扫描随笔分类
  const essayBooks = scanCategory('随笔');
  books.push(...essayBooks);

  // 扫描诗歌分类
  const poetryBooks = scanCategory('诗歌');
  books.push(...poetryBooks);

  console.log('bookScanner: 扫描到的书籍数量:', books.length);
  books.forEach(book => {
    console.log('bookScanner: 书籍信息:', book.title, book.author, book.format, book.epubUrl);
  });

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
      cover: '',
      content: ['EPUB格式电子书 - 请点击打开EPUB阅读器查看真实内容'],
      totalPages: 0, // EPUB格式无固定页数
      category: '随笔',
      filePath: '/books/随笔/瓦尔登湖/瓦尔登湖.epub',
      fileType: 'epub',
      format: 'epub',
      epubUrl: '/books/随笔/瓦尔登湖/瓦尔登湖.epub'
    });
  }

  if (category === '诗歌') {
    // 添加诗歌测试数据
    const poetryContent = generatePoetryContent(30);
    books.push({
      id: 'poetry-collection',
      title: '唐诗三百首',
      author: '蘅塘退士',
      cover: '',
      content: poetryContent,
      totalPages: poetryContent.length,
      category: '诗歌',
      filePath: '/src/datas/books/诗歌/唐诗三百首.txt',
      fileType: 'txt',
      format: 'txt'
    });
  }

  return books;
};

// 生成瓦尔登湖内容（暂未使用，保留供将来使用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateWaldenContent = (pageCount: number): string[] => {
  const content: string[] = [];
  const sampleText = `我在波地上种了大概两英亩半菜豆，由于那块地是十五年前才开垦的，我算在里面挖出两三车的树根，所以我并没有给它施肥；但在夏天时，我在锄土的过程中翻起过几车前辈，看来在这里居住过，种植过玉米和豆子，所以从某种程度上来说，土壤里的养分曾被我种的这种作物消耗殆尽。

在主要阿或者岩石植物未经过这路、太阳还没有从深树林背后升起，而所有的露珠还在叶子上闪烁的时候，我开始锄草或者由田里那些蔬菜，用泥土盖住它们的头部。我建议你尽量避免未消就把所有这些事情做完。每天清晨，我就是在田里劳动，在湖滨而软软的沙地上踩来踩去，感觉像是型木家般轻盈，但当到太阳出来，我的脚就变得沉重起来。

我很清楚地记得，在我四岁那年，父母带着我从波士顿回到这个故乡，当时经过这些树林，这块田地和这个湖。今晚，我的房子就在这片水面上，我是这里最早的居民。草原上唱歌的金丝雀也许还保持着当年的模样，大概是当年那些最早来到的鸟；许多年过去了，我终于手持锄头出现在这中景象，这些豆叶、玉米叶和土豆的叶子便是我在这里出现和消失的结果。

有时候我会遇到一些松鼠和野兔，它们匆忙地跑过田野，好像它们自己种了这些作物似的，当它们跑开时，我便欣然地观察着它们，心想它们将会怎样处理我的作物。但到了夏天，我更愿意和人类有一些接触，我会去看看邻居和朋友，听听他们的消息，或者到村里去买些必需品。

独处的生活让我对自然界有了更深的认识。我发现，人类真正需要的东西其实很少，只要能满足基本的生存需求，剩下的都是多余的。大多数人都在追求那些华而不实的东西，却忘记了生活的真谛。我在林中的这段时光，让我明白了简朴生活的价值。

清晨的湖面总是那么宁静，像一面巨大的镜子，映照着天空和周围的树林。我常常在这个时候坐在湖边，静静地观察着水面上的波纹，思考着生命的意义。这种与大自然的亲密接触，让我感到前所未有的平静和满足。

当夜幕降临时，我会点起煤油灯，在小屋里读书或写作。窗外传来各种动物的叫声，那是大自然的夜曲。在这样的环境中，我的思绪变得格外清晰，仿佛能看透生活的本质。这种简单而充实的生活，正是我一直向往的。`;

  const paragraphs = sampleText.split('\n\n').filter(p => p.trim());

  for (let i = 0; i < pageCount; i++) {
    const startIndex = (i * 3) % paragraphs.length;
    const selectedParagraphs = [];
    for (let j = 0; j < 4; j++) {
      selectedParagraphs.push(paragraphs[(startIndex + j) % paragraphs.length]);
    }
    content.push(selectedParagraphs.join('\n\n'));
  }

  return content;
};

// 生成诗歌内容
const generatePoetryContent = (pageCount: number): string[] => {
  const content: string[] = [];
  const poems = [
    '静夜思\n李白\n\n床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
    '登鹳雀楼\n王之涣\n\n白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
    '春晓\n孟浩然\n\n春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
    '望庐山瀑布\n李白\n\n日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。',
    '早发白帝城\n李白\n\n朝辞白帝彩云间，千里江陵一日还。\n两岸猿声啼不住，轻舟已过万重山。',
    '赋得古原草送别\n白居易\n\n离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。\n远芳侵古道，晴翠接荒城。\n又送王孙去，萋萋满别情。'
  ];

  for (let i = 0; i < pageCount; i++) {
    const selectedPoems = [];
    for (let j = 0; j < 3; j++) {
      selectedPoems.push(poems[(i * 3 + j) % poems.length]);
    }
    content.push(selectedPoems.join('\n\n'));
  }

  return content;
};

// 获取文件格式
// const getFileFormat = (filename: string): 'epub' | 'azw3' | 'mobi' | 'txt' | 'pdf' | 'unknown' => {
//   const ext = filename.toLowerCase().split('.').pop();
//   switch (ext) {
//     case 'epub': return 'epub';
//     case 'azw3': return 'azw3';
//     case 'mobi': return 'mobi';
//     case 'txt': return 'txt';
//     case 'pdf': return 'pdf';
//     default: return 'unknown';
//   }
// };

// 从文件名提取书籍信息
// const extractBookInfo = (filename: string, category: string) => {
//   const info = BOOK_INFO_MAP[filename];
//   if (info) {
//     return info;
//   }
//   
//   // 如果没有预定义信息，尝试从文件名提取
//   const nameWithoutExt = filename.replace(/\.[^.]+$/g, '').trim();
//   return {
//     title: nameWithoutExt,
//     author: '未知作者',
//     category: category
//   };
// };

export { scanBooksDirectory, scanCategory };