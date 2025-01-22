import { useState } from "react";
import "../styles/Search.css";

const SearchComponent = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("🔍 Trigger search with:", query);
    onSearch(query.trim()); // ✅ 直接传递搜索关键字
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={placeholder || "Enter search keywords..."}
        className="search-box"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-btn" onClick={() => handleSearch()}>
        Search
      </button>
    </div>
  );
};

export default SearchComponent;
