import { Platform } from 'react-native';

/**
 * Wrapper de RevenueCat (react-native-purchases).
 * - No funciona en web ni en Expo Go → se desactiva solo (devuelve vacío).
 * - Requiere la llave pública Android en EXPO_PUBLIC_RC_ANDROID_KEY.
 * - Entitlement esperado en RevenueCat: "premium".
 */
const ENTITLEMENT = 'premium';
const ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY;
const IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY;

let Purchases: any = null;
let configured = false;

function mod() {
  if (Platform.OS === 'web') return null;
  if (!Purchases) {
    try {
      Purchases = require('react-native-purchases').default;
    } catch {
      Purchases = null;
    }
  }
  return Purchases;
}

function apiKey() {
  return Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
}

/** ¿Está disponible la facturación (build nativo + llave configurada)? */
export function purchasesAvailable(): boolean {
  return Platform.OS !== 'web' && !!apiKey() && !!mod();
}

export async function initPurchases(appUserID?: string) {
  const P = mod();
  const key = apiKey();
  if (!P || !key) return;
  try {
    if (!configured) {
      P.configure({ apiKey: key, appUserID });
      configured = true;
    } else if (appUserID) {
      await P.logIn(appUserID);
    }
  } catch {
    /* noop */
  }
}

export interface RCPackage {
  id: string;
  title: string;
  priceString: string;
  period: string;
  raw: any;
}

const periodLabel = (type?: string) => {
  switch (type) {
    case 'WEEKLY': return '/semana';
    case 'MONTHLY': return '/mes';
    case 'ANNUAL': return '/año';
    case 'TWO_WEEK': return '/2 semanas';
    default: return '';
  }
};

export async function getPackages(): Promise<RCPackage[]> {
  const P = mod();
  if (!P || !apiKey()) return [];
  try {
    const offerings = await P.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    return pkgs.map((p: any) => ({
      id: p.identifier,
      title: p.product?.title?.replace(/\(.*\)/, '').trim() || p.identifier,
      priceString: p.product?.priceString ?? '',
      period: periodLabel(p.packageType),
      raw: p,
    }));
  } catch {
    return [];
  }
}

/** Devuelve true si tras la compra el usuario quedó premium. */
export async function purchase(pkg: RCPackage): Promise<boolean> {
  const P = mod();
  if (!P) return false;
  try {
    const { customerInfo } = await P.purchasePackage(pkg.raw);
    return !!customerInfo?.entitlements?.active?.[ENTITLEMENT];
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  const P = mod();
  if (!P) return false;
  const info = await P.restorePurchases();
  return !!info?.entitlements?.active?.[ENTITLEMENT];
}
