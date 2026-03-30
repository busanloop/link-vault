export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  memo: string;
  createdAt: string;
  favicon: string;
}

export interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  favicon: string;
}
