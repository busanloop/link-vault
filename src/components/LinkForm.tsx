"use client";

import { useState, useEffect, useRef } from "react";
import { LinkItem, LinkMetadata } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { classifyLink } from "@/lib/classify";

interface LinkFormProps {
  categories: string[];
  onSave: (link: LinkItem) => void;
  onAddCategory: (category: string) => void;
}

export default function LinkForm({ categories, onSave, onAddCategory }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<LinkMetadata>({ title: "", description: "", image: "", favicon: "" });
  const [category, setCategory] = useState("일반");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 클립보드 감지: 페이지 포커스 시 클립보드에서 URL 읽기
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && isValidUrl(text) && text !== url) {
          setUrl(text);
          fetchMetadata(text);
        }
      } catch {
        // 클립보드 권한이 없는 경우 무시
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [url]);

  function isValidUrl(str: string): boolean {
    try {
      const u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function fetchMetadata(targetUrl: string) {
    if (!isValidUrl(targetUrl)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data: LinkMetadata = await res.json();
      setMeta(data);
      // 자동 카테고리 분류
      const autoCategory = classifyLink(targetUrl, data, categories);
      setCategory(autoCategory);
    } catch {
      setMeta({ title: "", description: "", image: "", favicon: "" });
    }
    setLoading(false);
  }

  function handleUrlPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (isValidUrl(pasted)) {
      setTimeout(() => fetchMetadata(pasted), 0);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
  }

  function handleUrlBlur() {
    if (url && isValidUrl(url) && !meta.title) {
      fetchMetadata(url);
    }
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSave() {
    if (!url || !isValidUrl(url)) return;

    const link: LinkItem = {
      id: generateId(),
      url,
      title: meta.title || url,
      description: meta.description,
      image: meta.image,
      favicon: meta.favicon,
      category,
      tags,
      memo,
      createdAt: new Date().toISOString(),
    };

    onSave(link);
    resetForm();
  }

  function resetForm() {
    setUrl("");
    setMeta({ title: "", description: "", image: "", favicon: "" });
    setCategory("일반");
    setTags([]);
    setTagInput("");
    setMemo("");
    inputRef.current?.focus();
  }

  function handleAddCategory() {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setCategory(newCategory.trim());
    }
    setNewCategory("");
    setShowNewCategory(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">링크 저장</h2>

      {/* URL 입력 */}
      <div>
        <div className="relative">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={handleUrlChange}
            onPaste={handleUrlPaste}
            onBlur={handleUrlBlur}
            placeholder="링크를 붙여넣으세요"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* 미리보기 */}
      {(meta.title || meta.image) && (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {meta.image && (
            <img
              src={meta.image}
              alt=""
              className="w-24 h-24 object-cover rounded-lg shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {meta.favicon && (
                <img
                  src={meta.favicon}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <p className="text-sm font-medium text-gray-900 truncate">{meta.title}</p>
            </div>
            {meta.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{meta.description}</p>
            )}
          </div>
        </div>
      )}

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                category === cat
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
          {showNewCategory ? (
            <div className="flex gap-1">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="카테고리명"
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="px-2 py-1.5 text-sm bg-blue-500 text-white rounded-lg"
              >
                추가
              </button>
              <button
                onClick={() => { setShowNewCategory(false); setNewCategory(""); }}
                className="px-2 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              + 추가
            </button>
          )}
        </div>
      </div>

      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-600">
                &times;
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="태그 입력 후 Enter"
            className="flex-1 min-w-[120px] px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모를 남겨보세요"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
        />
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        disabled={!url || !isValidUrl(url)}
        className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
      >
        저장하기
      </button>
    </div>
  );
}
