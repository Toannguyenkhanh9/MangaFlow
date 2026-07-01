export function getLocalizedText(
  value?: Record<string, string>,
  preferred = 'en',
) {
  if (!value) {
    return '';
  }

  return (
    value[preferred] ||
    value.en ||
    value.vi ||
    value.ja ||
    value['ja-ro'] ||
    Object.values(value)[0] ||
    ''
  );
}

export function cleanChapterTitle(
  chapter?: string | null,
  title?: string | null,
) {
  const chapterText = chapter ? `Chapter ${chapter}` : 'Chapter';
  return title ? `${chapterText}: ${title}` : chapterText;
}

export function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}
