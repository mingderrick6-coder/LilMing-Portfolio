export type Project = {
  slug: string;
  title: string;
  year?: number;
  description?: string;
  image: string;
  thumbnail: string;
  secondImage?: string;
  playbackId?: string;
  behanceUrl?: string;
};

const assetRoot = "/works";

export const projects: Project[] = [
  {
    slug: "cb-cup-kv",
    title: "CB杯KV",
    image: `${assetRoot}/cb-cup-kv.webp`,
    thumbnail: `${assetRoot}/cb-cup-kv-thumb.webp`
  },
  {
    slug: "dimoo-factory-kv",
    title: "DIMOO工厂KV",
    image: `${assetRoot}/dimoo-factory-kv.webp`,
    thumbnail: `${assetRoot}/dimoo-factory-kv-thumb.webp`
  },
  {
    slug: "dimoo-popping-candy-kv",
    title: "DIMOO跳跳糖KV",
    image: `${assetRoot}/dimoo-popping-candy-kv.webp`,
    thumbnail: `${assetRoot}/dimoo-popping-candy-kv-thumb.webp`
  },
  {
    slug: "into1-meeting-kv",
    title: "into1见面会主KV",
    image: `${assetRoot}/into1-meeting-kv.webp`,
    thumbnail: `${assetRoot}/into1-meeting-kv-thumb.webp`
  },
  {
    slug: "oatly-illustration-1",
    title: "OATLY插画1.0",
    image: `${assetRoot}/oatly-illustration-1.webp`,
    thumbnail: `${assetRoot}/oatly-illustration-1-thumb.webp`
  },
  {
    slug: "oatly-illustration-2",
    title: "OATLY插画2.0",
    image: `${assetRoot}/oatly-illustration-2.webp`,
    thumbnail: `${assetRoot}/oatly-illustration-2-thumb.webp`
  },
  {
    slug: "pai",
    title: "PAI",
    image: `${assetRoot}/pai.webp`,
    thumbnail: `${assetRoot}/pai-thumb.webp`
  },
  {
    slug: "pai-promotion",
    title: "PAI宣传物料",
    image: `${assetRoot}/pai-promotion.webp`,
    thumbnail: `${assetRoot}/pai-promotion-thumb.webp`
  },
  {
    slug: "mid-autumn-exhibition",
    title: "中秋节展陈",
    image: `${assetRoot}/mid-autumn-exhibition.webp`,
    thumbnail: `${assetRoot}/mid-autumn-exhibition-thumb.webp`
  },
  {
    slug: "yogurt-zhang-yixing-kv",
    title: "产酸奶张艺兴主KV",
    image: `${assetRoot}/yogurt-zhang-yixing-kv.webp`,
    thumbnail: `${assetRoot}/yogurt-zhang-yixing-kv-thumb.webp`
  },
  {
    slug: "creative-poster-1",
    title: "创意海报1.0",
    image: `${assetRoot}/creative-poster-1.webp`,
    thumbnail: `${assetRoot}/creative-poster-1-thumb.webp`
  },
  {
    slug: "creative-poster-2",
    title: "创意海报2.0",
    image: `${assetRoot}/creative-poster-2.webp`,
    thumbnail: `${assetRoot}/creative-poster-2-thumb.webp`
  },
  {
    slug: "hehe-cny",
    title: "合合CNY",
    image: `${assetRoot}/hehe-cny.webp`,
    thumbnail: `${assetRoot}/hehe-cny-thumb.webp`
  },
  {
    slug: "hehe-merchandise",
    title: "合合文创周边",
    image: `${assetRoot}/hehe-merchandise-v2.webp`,
    thumbnail: `${assetRoot}/hehe-merchandise-v2-thumb.webp`,
    secondImage: `${assetRoot}/hehe-merchandise-photo.webp`
  },
  {
    slug: "earth-reading-day-kv",
    title: "地球&读书日KV",
    image: `${assetRoot}/earth-reading-day-kv.webp`,
    thumbnail: `${assetRoot}/earth-reading-day-kv-thumb.webp`
  },
  {
    slug: "summer-cooling-kv",
    title: "夏日消暑计划KV",
    image: `${assetRoot}/summer-cooling-kv.webp`,
    thumbnail: `${assetRoot}/summer-cooling-kv-thumb.webp`
  },
  {
    slug: "totole-science-quiz",
    title: "太太乐科学知识竞赛",
    image: `${assetRoot}/totole-science-quiz.webp`,
    thumbnail: `${assetRoot}/totole-science-quiz-thumb.webp`
  },
  {
    slug: "totole-fresh-challenge",
    title: "太太乐鲜闯为快",
    image: `${assetRoot}/totole-fresh-challenge.webp`,
    thumbnail: `${assetRoot}/totole-fresh-challenge-thumb.webp`
  },
  {
    slug: "avatar-illustration-1",
    title: "头像插画1.0",
    image: `${assetRoot}/avatar-illustration-1.webp`,
    thumbnail: `${assetRoot}/avatar-illustration-1-thumb.webp`
  },
  {
    slug: "avatar-illustration-2",
    title: "头像插画2.0",
    image: `${assetRoot}/avatar-illustration-2.webp`,
    thumbnail: `${assetRoot}/avatar-illustration-2-thumb.webp`
  },
  {
    slug: "mango-pomelo-smile-kv",
    title: "杨枝甘露笑脸包KV",
    image: `${assetRoot}/mango-pomelo-smile-kv.webp`,
    thumbnail: `${assetRoot}/mango-pomelo-smile-kv-thumb.webp`
  },
  {
    slug: "zhen-yogurt-poster",
    title: "甄酸奶海报",
    image: `${assetRoot}/zhen-yogurt-poster.webp`,
    thumbnail: `${assetRoot}/zhen-yogurt-poster-thumb.webp`
  },
  {
    slug: "chunzhen-popmart-christmas-kv",
    title: "纯甄x泡泡玛特圣诞KV",
    image: `${assetRoot}/chunzhen-popmart-christmas-kv.webp`,
    thumbnail: `${assetRoot}/chunzhen-popmart-christmas-kv-thumb.webp`
  },
  {
    slug: "chan-yogurt-expression-poster",
    title: "馋酸奶人物表情海报",
    image: `${assetRoot}/chan-yogurt-expression-poster.webp`,
    thumbnail: `${assetRoot}/chan-yogurt-expression-poster-thumb.webp`
  },
  {
    slug: "chan-yogurt-illustration-poster",
    title: "馋酸奶插画海报",
    image: `${assetRoot}/chan-yogurt-illustration-poster.webp`,
    thumbnail: `${assetRoot}/chan-yogurt-illustration-poster-thumb.webp`
  },
  {
    slug: "chan-yogurt-new-product-kv",
    title: "馋酸奶新品KV",
    image: `${assetRoot}/chan-yogurt-new-product-kv.webp`,
    thumbnail: `${assetRoot}/chan-yogurt-new-product-kv-thumb.webp`
  }
];

export const siteContent = {
  role: "motion & sound designer",
  location: "based in paris",
  email: "648837827@qq.com",
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "X / Twitter", href: "https://www.x.com/pacomepertant" },
    { label: "Behance", href: "https://www.behance.net/pacomepertant" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/pac%C3%B4me-pertant-b4437126b/" }
  ]
};
