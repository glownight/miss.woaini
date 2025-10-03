import React, { useState } from "react";
import { motion } from "framer-motion";
import { getAllCategories, type Book } from "../utils/bookUtils";
import "../pages/BookReader.css"; // 使用原有的CSS

interface BookShelfProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const BookShelf: React.FC<BookShelfProps> = ({ books, onBookSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 过滤书籍
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = getAllCategories();

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
                  onClick={() => onBookSelect(book)}
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
                      {book.format?.toUpperCase() || "EPUB"}
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

export default BookShelf;
