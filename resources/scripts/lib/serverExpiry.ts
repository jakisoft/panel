export interface ExpirationInfo {
  label: string;
  expired: boolean;
}

export const getExpirationInfo = (expDate: string | null): ExpirationInfo => {
  if (!expDate) return { label: 'Unlimited', expired: false };

  const parsed = new Date(expDate);
  if (Number.isNaN(parsed.getTime())) return { label: expDate, expired: false };

  return {
    label: parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    expired: parsed.getTime() < Date.now(),
  };
};
