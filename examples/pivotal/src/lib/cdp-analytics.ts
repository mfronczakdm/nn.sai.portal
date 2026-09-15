export function isCdpAnalyticsEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS === 'true' || process.env.NODE_ENV !== 'development'
  );
}
