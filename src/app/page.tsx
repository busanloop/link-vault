"use client";

import { useState, useEffect, useMemo } from "react";
import { LinkItem } from "@/lib/types";
import { getLinks, addLink, updateLink, deleteLink, getCategories, saveCategories } from "@/lib/storage";
import LinkForm from "@/components/LinkForm";
import LinkCard from "@/components/LinkCard";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLinks(getLinks());
    setCategories(getCategories());
    setMounted(true);
  }, []);

  const filteredLinks = useMemo(() => {
    let result = [...links];

    if (selectedCategory !== "전체") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.memo.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? db - da : da - db;
    });

    return result;
  }, [links, search, selectedCategory, sortBy]);

  function handleSave(link: LinkItem) {
    const updated = addLink(link);
    setLinks(updated);

    // Google Sheets에 비동기 저장 (실패해도 로컬 저장은 유지)
    fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(link),
    }).catch(() => {});
  }

  function handleDelete(id: string) {
    const updated = deleteLink(id);
    setLinks(updated);
  }

  function handleEdit(id: string, updates: Partial<LinkItem>) {
    const updated = updateLink(id, updates);
    setLinks(updated);
  }

  function handleAddCategory(cat: string) {
    const updated = [...categories, cat];
    setCategories(updated);
    saveCategories(updated);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">LinkVault</h1>
          </div>
          <span className="text-sm text-gray-400">나만의 링크 저장소</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* 왼쪽: 링크 입력 폼 */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <LinkForm
              categories={categories}
              onSave={handleSave}
              onAddCategory={handleAddCategory}
            />
          </div>

          {/* 오른쪽: 링크 목록 */}
          <div className="space-y-6">
            <SearchBar
              search={search}
              onSearchChange={setSearch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={links.length}
              filteredCount={filteredLinks.length}
            />

            {filteredLinks.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {links.length === 0
                    ? "아직 저장된 링크가 없습니다.\n링크를 복사하거나 붙여넣어 시작해보세요!"
                    : "검색 결과가 없습니다."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
