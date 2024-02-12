export function getLeatherBTCProvider() {
  let provider = window.btc;

  provider = (window as unknown as any).LeatherProvider;
  if (!provider) {
    throw new Error("BTC provider not found");
  }

  return provider!;
}
