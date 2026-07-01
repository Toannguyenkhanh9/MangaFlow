import {getLocalizedText} from '../utils/manga';

const API_BASE = 'https://api.mangadex.org';

export type MangaRelationship = {id: string; type: string; attributes?: {fileName?: string; name?: string}};
export type MangaTag = {id: string; type: 'tag'; attributes: {name: Record<string, string>; description?: Record<string, string>; group?: string; version?: number}};
export type MangaItem = {
  id: string;
  type: 'manga';
  attributes: {
    title?: Record<string, string>;
    altTitles?: Array<Record<string, string>>;
    description?: Record<string, string>;
    status?: string;
    year?: number;
    contentRating?: string;
    tags?: MangaTag[];
  };
  relationships?: MangaRelationship[];
};
export type ChapterItem = {id: string; type: 'chapter'; attributes: {title?: string | null; chapter?: string | null; volume?: string | null; translatedLanguage?: string; pages?: number; publishAt?: string}; relationships?: MangaRelationship[]};
export type ChapterPagesResponse = {baseUrl: string; chapter: {hash: string; data: string[]; dataSaver: string[]}};
export type MangaSort = 'latest' | 'popular';
export type MangaListParams = {language: string; sort: MangaSort; query?: string; tagId?: string | null; limit?: number};

function buildUrl(path: string) { return `${API_BASE}${path}`; }
async function requestJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {headers: {Accept: 'application/json'}});
  if (!res.ok) throw new Error(`MangaDex error ${res.status}: ${await res.text()}`);
  return res.json();
}
function appendContentRatings(url: URL) {
  url.searchParams.append('contentRating[]', 'safe');
  url.searchParams.append('contentRating[]', 'suggestive');
}
function appendIncludes(url: URL) {
  url.searchParams.append('includes[]', 'cover_art');
  url.searchParams.append('includes[]', 'author');
  url.searchParams.append('includes[]', 'artist');
}
function appendOrder(url: URL, sort: MangaSort) {
  if (sort === 'popular') url.searchParams.append('order[followedCount]', 'desc');
  else url.searchParams.append('order[latestUploadedChapter]', 'desc');
}

export async function getMangaTags(language = 'en') {
  const json = await requestJson<{data: MangaTag[]}>(buildUrl('/manga/tag'));
  return json.data.filter(tag => tag.attributes.group === 'genre').sort((a, b) => {
    const nameA = getLocalizedText(a.attributes.name, language) || getLocalizedText(a.attributes.name, 'en');
    const nameB = getLocalizedText(b.attributes.name, language) || getLocalizedText(b.attributes.name, 'en');
    return nameA.localeCompare(nameB);
  });
}

export async function getMangaList(params: MangaListParams) {
  const url = new URL(`${API_BASE}/manga`);
  url.searchParams.append('limit', String(params.limit || 40));
  url.searchParams.append('availableTranslatedLanguage[]', params.language);
  appendIncludes(url);
  appendContentRatings(url);
  appendOrder(url, params.sort);
  if (params.query?.trim()) url.searchParams.append('title', params.query.trim());
  if (params.tagId) {
    url.searchParams.append('includedTags[]', params.tagId);
    url.searchParams.append('includedTagsMode', 'AND');
  }
  const json = await requestJson<{data: MangaItem[]}>(url.toString());
  return json.data;
}

export async function searchManga(keyword: string, language = 'en') { return getMangaList({query: keyword, language, sort: 'latest'}); }
export async function getPopularManga(language = 'en') { return getMangaList({language, sort: 'popular'}); }
export async function getLatestManga(language = 'en') { return getMangaList({language, sort: 'latest'}); }

export async function getChapters(mangaId: string, language = 'en') {
  let offset = 0;
  const limit = 100;
  let total = 0;
  const chapters: ChapterItem[] = [];
  do {
    const url = new URL(`${API_BASE}/chapter`);
    url.searchParams.append('manga', mangaId);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('offset', String(offset));
    url.searchParams.append('translatedLanguage[]', language);
    url.searchParams.append('order[chapter]', 'asc');
    url.searchParams.append('order[publishAt]', 'asc');
    url.searchParams.append('includes[]', 'scanlation_group');
    const json = await requestJson<{data: ChapterItem[]; total: number}>(url.toString());
    chapters.push(...json.data);
    total = json.total;
    offset += limit;
  } while (chapters.length < total && offset < 1000);
  return chapters;
}

export async function getChapterPages(chapterId: string, dataSaver = true) {
  const json = await requestJson<ChapterPagesResponse>(buildUrl(`/at-home/server/${chapterId}`));
  const saverFiles = json.chapter.dataSaver || [];
  const fullFiles = json.chapter.data || [];
  const files = dataSaver && saverFiles.length > 0 ? saverFiles : fullFiles;
  const folder = dataSaver && saverFiles.length > 0 ? 'data-saver' : 'data';
  return files.map(file => `${json.baseUrl}/${folder}/${json.chapter.hash}/${file}`);
}

export function getMangaTitle(manga: MangaItem, language = 'en') { return getLocalizedText(manga.attributes.title, language) || getLocalizedText(manga.attributes.title, 'en') || 'No title'; }
export function getMangaDescription(manga: MangaItem, language = 'en') { return getLocalizedText(manga.attributes.description, language); }
export function getMangaTagNames(manga: MangaItem, language = 'en') {
  return (manga.attributes.tags || []).filter(tag => tag.attributes.group === 'genre').map(tag => getLocalizedText(tag.attributes.name, language) || getLocalizedText(tag.attributes.name, 'en')).filter(Boolean);
}
export function getMangaCoverUrl(manga: MangaItem, size: 256 | 512 = 512) {
  const cover = manga.relationships?.find(item => item.type === 'cover_art');
  const fileName = cover?.attributes?.fileName;
  if (!fileName) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.${size}.jpg`;
}
