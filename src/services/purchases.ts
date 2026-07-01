import {Platform} from 'react-native';

export const REMOVE_ADS_PRODUCT_ID =
  Platform.OS === 'ios' ? 'com.mangaflow.removeads' : 'remove_ads';

export async function initPurchases() {
  return false;
}

export async function endPurchases() {
  return false;
}

export async function buyRemoveAds() {
  throw new Error('IAP is disabled in this build.');
}

export async function restoreRemoveAds() {
  return false;
}
