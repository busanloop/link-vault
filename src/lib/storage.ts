import { LinkItem } from "./types";

const STORAGE_KEY = "link-vault-items";
const CATEGORIES_KEY = "link-vault-categories";

export function getLinks(): LinkItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLinks(links: LinkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function addLink(link: LinkItem) {
  const links = getLinks();
  links.unshift(link);
  saveLinks(links);
  return links;
}

export function updateLink(id: string, updates: Partial<LinkItem>) {
  const links = getLinks();
  const idx = links.findIndex((l) => l.id === id);
  if (idx !== -1) {
    links[idx] = { ...links[idx], ...updates };
    saveLinks(links);
  }
  return links;
}

export function deleteLink(id: string) {
  const links = getLinks().filter((l) => l.id !== id);
  saveLinks(links);
  return links;
}

export function getCategories(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : ["일반", "개발", "뉴스", "참고자료", "영상"];
}

export function saveCategories(categories: string[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
