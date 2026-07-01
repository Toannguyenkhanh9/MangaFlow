import mobileAds, {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

export const bannerUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz';

let interstitial = InterstitialAd.createForAdRequest(interstitialUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

let loaded = false;
let loading = false;
let initialized = false;

function attachInterstitialEvents() {
  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
    loading = false;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    loading = false;
    loadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    loading = false;
  });
}

export function initAds() {
  if (initialized) {
    return;
  }

  initialized = true;

  mobileAds()
    .initialize()
    .finally(() => {
      attachInterstitialEvents();
      loadInterstitial();
    });
}

export function loadInterstitial() {
  if (loading || loaded) {
    return;
  }

  loading = true;
  interstitial.load();
}

export async function showInterstitialIfReady(removeAds: boolean) {
  if (removeAds) {
    return;
  }

  if (!loaded) {
    loadInterstitial();
    return;
  }

  try {
    await interstitial.show();
  } catch {
    loaded = false;
    loading = false;
    loadInterstitial();
  }
}
