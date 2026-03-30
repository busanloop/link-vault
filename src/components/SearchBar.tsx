"use client";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortBy: "newest" | "oldest";
  onSortChange: (value: "newest" | "oldest") => void;
  totalCount: number;
  filteredCount: number;
}

export default function SearchBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="제목, URL, 메모, 태그로 검색"
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
        />
      </div>

      {/* 필터 & 정렬 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onCategoryChange("전체")}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${
              selectedCategory === "전체"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs text-gray-400">
            {filteredCount === totalCount ? `${totalCount}개` : `${filteredCount}/${totalCount}개`}
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as "newest" | "oldest")}
            className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>
      </div>
    </div>
  );
}
