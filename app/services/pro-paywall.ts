import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';

/** Paywall da RevenueCat (vindo do antigo chat do Planejador). true quando o usuário tem o Pro. */
export async function presentPaywall(): Promise<boolean> {
  const customer = await Purchases.getCustomerInfo();
  if (customer.entitlements.active['pro']) return true;
  try {
    const restore = await Purchases.restorePurchases();
    if (restore.entitlements.active['pro']) return true;
  } catch {
    // Sem compra a restaurar: segue para o paywall.
  }
  const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
  return (
    result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED
  );
}
