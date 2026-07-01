export type AppLanguage =
  | 'vi'
  | 'en'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'es'
  | 'fr'
  | 'de'
  | 'th'
  | 'id'
  | 'pt';

export type TranslationKey =
  | 'app.subtitle'

  | 'common.search'
  | 'common.retry'
  | 'common.loading'
  | 'common.cancel'
  | 'common.delete'
  | 'common.clear'
  | 'common.save'
  | 'common.saved'
  | 'common.remove'
  | 'common.latest'
  | 'common.popular'
  | 'common.genres'
  | 'common.all'
  | 'common.status'
  | 'common.year'
  | 'common.pages'
  | 'common.chapter'
  | 'common.noCover'

  | 'tabs.home'
  | 'tabs.favorites'
  | 'tabs.history'
  | 'tabs.settings'

  | 'home.title'
  | 'home.searchPlaceholder'
  | 'home.latestManga'
  | 'home.popularManga'
  | 'home.searchResults'
  | 'home.pickGenre'
  | 'home.noMangaTitle'
  | 'home.noMangaMessage'
  | 'home.loadError'
  | 'home.searchError'

  | 'detail.title'
  | 'detail.chapterLanguage'
  | 'detail.favoriteAdd'
  | 'detail.favoriteSaved'
  | 'detail.chapterList'
  | 'detail.noChapters'
  | 'detail.loadChapterError'

  | 'reader.title'
  | 'reader.saver'
  | 'reader.hd'
  | 'reader.loadingPages'
  | 'reader.loadPagesError'
  | 'reader.emptyPages'

  | 'favorites.title'
  | 'favorites.subtitle'
  | 'favorites.emptyTitle'
  | 'favorites.emptyMessage'
  | 'favorites.remove'

  | 'history.title'
  | 'history.subtitle'
  | 'history.emptyTitle'
  | 'history.emptyMessage'
  | 'history.clearTitle'
  | 'history.clearMessage'

  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.appLanguage'
  | 'settings.contentLanguage'
  | 'settings.contentLanguageDesc'
  | 'settings.darkMode'
  | 'settings.currentTheme'
  | 'settings.themeDark'
  | 'settings.themeLight'
  | 'settings.ads'
  | 'settings.adsOn'
  | 'settings.adsOff'
  | 'settings.removeAds'
  | 'settings.restore'
  | 'settings.devToggle'
  | 'settings.footer'
  | 'settings.iapDisabledTitle'
  | 'settings.iapDisabledMessage'
  | 'settings.restoreNotFound'
  | 'settings.restored';

const en: Record<TranslationKey, string> = {
  'app.subtitle': 'Read manga smoothly and filter by your preferred language.',

  'common.search': 'Search',
  'common.retry': 'Retry',
  'common.loading': 'Loading...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.clear': 'Clear',
  'common.save': 'Save',
  'common.saved': 'Saved',
  'common.remove': 'Remove',
  'common.latest': 'Latest',
  'common.popular': 'Popular',
  'common.genres': 'Genres',
  'common.all': 'All',
  'common.status': 'Status',
  'common.year': 'Year',
  'common.pages': 'pages',
  'common.chapter': 'Chapter',
  'common.noCover': 'No Cover',

  'tabs.home': 'Home',
  'tabs.favorites': 'Favorites',
  'tabs.history': 'History',
  'tabs.settings': 'Settings',

  'home.title': 'MangaFlow',
  'home.searchPlaceholder': 'Search manga...',
  'home.latestManga': 'Latest manga',
  'home.popularManga': 'Popular manga',
  'home.searchResults': 'Search results',
  'home.pickGenre': 'Pick a genre',
  'home.noMangaTitle': 'No manga yet',
  'home.noMangaMessage':
    'Try another content language, English title, or genre.',
  'home.loadError': 'Unable to load manga.',
  'home.searchError': 'Unable to search manga. Please try again.',

  'detail.title': 'Details',
  'detail.chapterLanguage': 'Chapter language',
  'detail.favoriteAdd': 'Add favorite',
  'detail.favoriteSaved': 'Favorite saved',
  'detail.chapterList': 'Chapter list',
  'detail.noChapters': 'No chapters for this language.',
  'detail.loadChapterError': 'Unable to load chapters.',

  'reader.title': 'Reader',
  'reader.saver': 'Saver',
  'reader.hd': 'HD',
  'reader.loadingPages': 'Loading pages...',
  'reader.loadPagesError': 'Unable to load pages.',
  'reader.emptyPages': 'This chapter has no pages.',

  'favorites.title': 'Favorites',
  'favorites.subtitle': 'Manga you saved to read later.',
  'favorites.emptyTitle': 'No favorites yet',
  'favorites.emptyMessage': 'Open a manga detail page and save it here.',
  'favorites.remove': 'Remove from favorites',

  'history.title': 'Reading history',
  'history.subtitle': 'Opened chapters are saved automatically.',
  'history.emptyTitle': 'No history yet',
  'history.emptyMessage': 'When you open a chapter, it will appear here.',
  'history.clearTitle': 'Clear history',
  'history.clearMessage': 'Are you sure you want to clear all reading history?',

  'settings.title': 'Settings',
  'settings.subtitle': 'Customize MangaFlow your way.',
  'settings.appLanguage': 'App language',
  'settings.contentLanguage': 'Content language',
  'settings.contentLanguageDesc':
    'The app filters manga that have chapters in this language.',
  'settings.darkMode': 'Dark mode',
  'settings.currentTheme': 'Current',
  'settings.themeDark': 'Dark',
  'settings.themeLight': 'Light',
  'settings.ads': 'Ads & Remove Ads',
  'settings.adsOn': 'Ads are enabled',
  'settings.adsOff': 'Ads are removed',
  'settings.removeAds': 'Buy Remove Ads',
  'settings.restore': 'Restore purchase',
  'settings.devToggle': 'DEV: Toggle Remove Ads',
  'settings.footer':
    'MangaFlow uses MangaDex API for metadata and chapter images. Check content rights carefully before publishing.',
  'settings.iapDisabledTitle': 'IAP disabled',
  'settings.iapDisabledMessage':
    'Purchases are disabled in this build to avoid build errors. Enable it again after choosing a compatible IAP version.',
  'settings.restoreNotFound': 'No Remove Ads purchase found.',
  'settings.restored': 'Remove Ads purchase restored.',
};

const vi: Record<TranslationKey, string> = {
  'app.subtitle': 'Đọc manga mượt, nhẹ và lọc theo ngôn ngữ bạn chọn.',

  'common.search': 'Tìm',
  'common.retry': 'Thử lại',
  'common.loading': 'Đang tải...',
  'common.cancel': 'Hủy',
  'common.delete': 'Xóa',
  'common.clear': 'Xóa',
  'common.save': 'Lưu',
  'common.saved': 'Đã lưu',
  'common.remove': 'Xóa',
  'common.latest': 'Mới nhất',
  'common.popular': 'Yêu thích',
  'common.genres': 'Thể loại',
  'common.all': 'Tất cả',
  'common.status': 'Trạng thái',
  'common.year': 'Năm',
  'common.pages': 'trang',
  'common.chapter': 'Chapter',
  'common.noCover': 'Không có ảnh',

  'tabs.home': 'Trang chủ',
  'tabs.favorites': 'Yêu thích',
  'tabs.history': 'Lịch sử',
  'tabs.settings': 'Cài đặt',

  'home.title': 'MangaFlow',
  'home.searchPlaceholder': 'Tìm manga...',
  'home.latestManga': 'Manga mới nhất',
  'home.popularManga': 'Manga được yêu thích',
  'home.searchResults': 'Kết quả tìm kiếm',
  'home.pickGenre': 'Chọn thể loại',
  'home.noMangaTitle': 'Chưa có manga',
  'home.noMangaMessage':
    'Thử đổi ngôn ngữ nội dung, tìm tên tiếng Anh hoặc chọn thể loại khác.',
  'home.loadError': 'Không tải được danh sách manga.',
  'home.searchError': 'Không tìm được manga. Vui lòng thử lại.',

  'detail.title': 'Chi tiết',
  'detail.chapterLanguage': 'Ngôn ngữ chapter',
  'detail.favoriteAdd': 'Lưu yêu thích',
  'detail.favoriteSaved': 'Đã lưu yêu thích',
  'detail.chapterList': 'Danh sách chapter',
  'detail.noChapters': 'Không có chapter cho ngôn ngữ này.',
  'detail.loadChapterError': 'Không tải được chapter.',

  'reader.title': 'Đọc truyện',
  'reader.saver': 'Tiết kiệm',
  'reader.hd': 'HD',
  'reader.loadingPages': 'Đang tải trang...',
  'reader.loadPagesError': 'Không tải được trang truyện.',
  'reader.emptyPages': 'Chapter này không có trang.',

  'favorites.title': 'Yêu thích',
  'favorites.subtitle': 'Truyện bạn đã lưu để đọc sau.',
  'favorites.emptyTitle': 'Chưa có truyện yêu thích',
  'favorites.emptyMessage':
    'Mở chi tiết manga rồi bấm lưu yêu thích để thêm vào đây.',
  'favorites.remove': 'Xóa khỏi yêu thích',

  'history.title': 'Lịch sử đọc',
  'history.subtitle': 'Tự động lưu chapter đã mở.',
  'history.emptyTitle': 'Chưa có lịch sử',
  'history.emptyMessage':
    'Khi bạn mở một chapter, app sẽ tự lưu lịch sử đọc ở đây.',
  'history.clearTitle': 'Xóa lịch sử',
  'history.clearMessage':
    'Bạn có chắc muốn xóa toàn bộ lịch sử đọc không?',

  'settings.title': 'Cài đặt',
  'settings.subtitle': 'Tùy chỉnh MangaFlow theo cách bạn muốn.',
  'settings.appLanguage': 'Ngôn ngữ giao diện',
  'settings.contentLanguage': 'Ngôn ngữ nội dung',
  'settings.contentLanguageDesc':
    'App sẽ lọc manga có chapter theo ngôn ngữ này.',
  'settings.darkMode': 'Dark mode',
  'settings.currentTheme': 'Hiện tại',
  'settings.themeDark': 'Tối',
  'settings.themeLight': 'Sáng',
  'settings.ads': 'Quảng cáo & Remove Ads',
  'settings.adsOn': 'Đang hiển thị quảng cáo',
  'settings.adsOff': 'Đã tắt quảng cáo',
  'settings.removeAds': 'Mua Remove Ads',
  'settings.restore': 'Khôi phục mua hàng',
  'settings.devToggle': 'DEV: Toggle Remove Ads',
  'settings.footer':
    'MangaFlow dùng MangaDex API để tải metadata và ảnh chapter. Khi public store, bạn nên kiểm tra kỹ quyền sử dụng nội dung.',
  'settings.iapDisabledTitle': 'IAP chưa bật',
  'settings.iapDisabledMessage':
    'Bản build này đang tạm tắt mua hàng để tránh lỗi build. Có thể bật lại sau khi chọn version IAP phù hợp.',
  'settings.restoreNotFound': 'Không tìm thấy giao dịch Remove Ads.',
  'settings.restored': 'Đã khôi phục giao dịch Remove Ads.',
};

const map: Record<AppLanguage, Record<TranslationKey, string>> = {
  vi,
  en,

  // Tạm dùng tiếng Anh cho các ngôn ngữ này để không lỗi type.
  // Sau này có thể thay bằng bản dịch riêng từng ngôn ngữ.
  ja: en,
  ko: en,
  zh: en,
  es: en,
  fr: en,
  de: en,
  th: en,
  id: en,
  pt: en,
};

export const APP_LANGUAGES: Array<{label: string; value: AppLanguage}> = [
  {label: 'Tiếng Việt', value: 'vi'},
  {label: 'English', value: 'en'},
  {label: '日本語', value: 'ja'},
  {label: '한국어', value: 'ko'},
  {label: '中文', value: 'zh'},
  {label: 'Español', value: 'es'},
  {label: 'Français', value: 'fr'},
  {label: 'Deutsch', value: 'de'},
  {label: 'ไทย', value: 'th'},
  {label: 'Indonesia', value: 'id'},
  {label: 'Português', value: 'pt'},
];

export const CONTENT_LANGUAGES: Array<{label: string; value: string}> = [
  {label: 'English', value: 'en'},
  {label: 'Tiếng Việt', value: 'vi'},
  {label: '日本語', value: 'ja'},
  {label: '한국어', value: 'ko'},
  {label: '中文', value: 'zh'},
  {label: 'Español', value: 'es'},
  {label: 'Français', value: 'fr'},
  {label: 'Deutsch', value: 'de'},
  {label: 'Português', value: 'pt-br'},
  {label: 'Indonesia', value: 'id'},
  {label: 'ไทย', value: 'th'},
  {label: 'Русский', value: 'ru'},
];

export function t(language: AppLanguage, key: TranslationKey) {
  return map[language]?.[key] || en[key] || key;
}