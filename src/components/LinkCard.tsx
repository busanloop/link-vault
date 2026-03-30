"use client";

import { LinkItem } from "@/lib/types";
import { useState } from "react";

interface LinkCardProps {
  link: LinkItem;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<LinkItem>) => void;
}

export default function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [editing, setEditing] = useState(false);
  const [editMemo, setEditMemo] = useState(link.memo);

  const domain = (() => {
    try {
      return new URL(link.url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  })();

  const timeAgo = getTimeAgo(link.createdAt);

  function handleSaveMemo() {
    onEdit(link.id, { memo: editMemo });
    setEditing(false);
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* 이미지 미리보기 */}
      {link.image && (
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <img
            src={link.image}
            alt=""
            className="w-full h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </a>
      )}

      <div className="p-4 space-y-3">
        {/* 제목 & 도메인 */}
        <div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              {link.favicon && (
                <img
                  src={link.favicon}
                  alt=""
                  className="w-4 h-4 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              {link.title}
            </span>
          </a>
          <p className="text-xs text-gray-400 mt-1">{domain}</p>
        </div>

        {/* 설명 */}
        {link.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{link.description}</p>
        )}

        {/* 카테고리 & 태그 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-md font-medium">
            {link.category}
          </span>
          {link.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* 메모 */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setEditMemo(link.memo); }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleSaveMemo}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        ) : link.memo ? (
          <p
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 bg-amber-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-100 transition"
          >
            {link.memo}
          </p>
        ) : null}

        {/* 하단: 시간 & 액션 */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-blue-500"
            >
              메모
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link.url);
              }}
              className="text-xs text-gray-400 hover:text-blue-500"
            >
              복사
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
