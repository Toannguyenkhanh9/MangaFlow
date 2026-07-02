export const REMOVE_ADS_PRODUCT_ID = 'disabled';

export async function initPurchases() {
  // Paid services disabled because MangaDex usage policy does not allow paid services.
  return false;
}

export async function endPurchases() {
  return false;
}

export async function buyRemoveAds() {
  throw new Error('Paid services are disabled for MangaDex-based builds.');
}

export async function restoreRemoveAds() {
  return false;
}
