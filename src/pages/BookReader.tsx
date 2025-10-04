import React, { useState, useEffect } from "react";
import { getBookList, type Book } from "../utils/bookUtils";
import EpubReader from "./EpubReader";
import BookShelf from "../components/BookShelf";

interface BookReaderProps {
  books: Book[];
}

const BookReader: React.FC<BookReaderProps> = ({ books }) => {
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [showEpubReader, setShowEpubReader] = useState(false);
  const [selectedEpubBook, setSelectedEpubBook] = useState<Book | null>(null);

  // 初始化书籍数据
  useEffect(() => {
    const loadBooks = () => {
      const bookList = getBookList();
      setAvailableBooks(bookList);
    };

    loadBooks();
  }, []);

  // 使用props中的books，如果没有则使用内部加载的books
  const booksToDisplay = books.length > 0 ? books : availableBooks;

  const handleBookSelect = (book: Book) => {
    // 只支持EPUB格式
    if (book.format === "epub" && book.epubUrl) {
      // 验证URL格式
      try {
        setSelectedEpubBook(book);
        setShowEpubReader(true);
      } catch (error) {
        setSelectedEpubBook({
          ...book,
          epubUrl: book.epubUrl.startsWith("/")
            ? book.epubUrl
            : `/${book.epubUrl}`,
        });
        setShowEpubReader(true);
      }
    } else {
      alert("当前只支持EPUB格式的电子书");
    }
  };

  const handleBackFromEpub = () => {
    setShowEpubReader(false);
    setSelectedEpubBook(null);
  };

  // EPUB阅读器模式
  if (showEpubReader && selectedEpubBook) {
    return (
      <EpubReader
        bookUrl={selectedEpubBook.epubUrl}
        bookTitle={selectedEpubBook.title}
        onBack={handleBackFromEpub}
      />
    );
  }

  // 书架视图
  return <BookShelf books={booksToDisplay} onBookSelect={handleBookSelect} />;
};

export default BookReader;
