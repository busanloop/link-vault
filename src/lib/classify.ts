import { LinkMetadata } from "./types";

interface DomainRule {
  patterns: string[];
  category: string;
}

const DOMAIN_RULES: DomainRule[] = [
  {
    category: "영상",
    patterns: [
      "youtube.com", "youtu.be", "vimeo.com", "twitch.tv",
      "dailymotion.com", "bilibili.com", "tiktok.com",
      "tv.naver.com", "tv.kakao.com", "afreecatv.com",
    ],
  },
  {
    category: "개발",
    patterns: [
      "github.com", "gitlab.com", "bitbucket.org",
      "stackoverflow.com", "stackexchange.com",
      "dev.to", "medium.com", "hashnode.dev",
      "npmjs.com", "pypi.org", "crates.io",
      "developer.mozilla.org", "w3schools.com",
      "vercel.com", "netlify.com", "heroku.com",
      "docker.com", "kubernetes.io",
      "velog.io", "tistory.com",
      "docs.google.com", "notion.so",
    ],
  },
  {
    category: "뉴스",
    patterns: [
      "news.naver.com", "news.daum.net",
      "chosun.com", "donga.com", "hani.co.kr", "khan.co.kr",
      "joins.com", "yna.co.kr", "ytn.co.kr", "sbs.co.kr",
      "kbs.co.kr", "mbc.co.kr", "bbc.com", "cnn.com",
      "reuters.com", "bloomberg.com", "nytimes.com",
      "theguardian.com", "washingtonpost.com",
      "techcrunch.com", "theverge.com", "wired.com",
      "zdnet.co.kr", "etnews.com", "bloter.net",
    ],
  },
];

const KEYWORD_RULES: { category: string; keywords: string[] }[] = [
  {
    category: "영상",
    keywords: ["video", "watch", "stream", "영상", "동영상", "시청"],
  },
  {
    category: "개발",
    keywords: [
      "github", "code", "api", "sdk", "framework", "library",
      "programming", "developer", "tutorial", "documentation",
      "개발", "코딩", "프로그래밍", "라이브러리", "프레임워크",
      "react", "vue", "angular", "node", "python", "java",
      "typescript", "javascript", "rust", "go", "docker",
    ],
  },
  {
    category: "뉴스",
    keywords: [
      "news", "article", "breaking", "report", "뉴스", "기사",
      "보도", "속보", "사설", "칼럼", "opinion",
    ],
  },
  {
    category: "참고자료",
    keywords: [
      "guide", "reference", "documentation", "docs", "wiki",
      "handbook", "manual", "가이드", "참고", "문서", "위키",
      "논문", "paper", "research", "study",
    ],
  },
];

export function classifyLink(
  url: string,
  meta: LinkMetadata,
  availableCategories: string[]
): string {
  // 1. 도메인 매칭
  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace("www.", "");
  } catch {
    return "일반";
  }

  for (const rule of DOMAIN_RULES) {
    if (rule.patterns.some((p) => hostname.includes(p))) {
      if (availableCategories.includes(rule.category)) {
        return rule.category;
      }
    }
  }

  // 2. 키워드 매칭 (제목 + 설명)
  const text = `${meta.title} ${meta.description}`.toLowerCase();

  let bestMatch = "";
  let bestScore = 0;

  for (const rule of KEYWORD_RULES) {
    if (!availableCategories.includes(rule.category)) continue;
    const score = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule.category;
    }
  }

  if (bestScore >= 1) {
    return bestMatch;
  }

  return "일반";
}
