export interface AnalyticsEvent {
  id: string;
  type: 'qr_scan' | 'page_view' | 'suggestion_click' | 'copy_action' | 'google_review_click';
  businessSlug: string;
  platform?: 'google' | 'yelp' | 'facebook' | 'trustpilot';
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalScans: number;
  totalViews: number;
  totalSuggestionClicks: number;
  totalCopies: number;
  totalGoogleClicks: number;
  conversionRate: number; // (Copies / Views) * 100
}

const STORAGE_KEY = 'reviewqr_analytics_events';

export const getStoredEvents = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
};

export const saveEvent = (event: AnalyticsEvent): void => {
  const events = getStoredEvents();
  events.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const trackEvent = (
  payload: Omit<AnalyticsEvent, 'id'>
): void => {
  const newEvent: AnalyticsEvent = {
    ...payload,
    id: 'evt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
  };
  saveEvent(newEvent);
};

export const getAnalyticsSummary = (businessSlug?: string): AnalyticsSummary => {
  const events = getStoredEvents().filter(
    (e) => !businessSlug || e.businessSlug === businessSlug
  );

  const totalScans = events.filter((e) => e.type === 'qr_scan').length;
  const totalViews = events.filter((e) => e.type === 'page_view').length;
  const totalSuggestionClicks = events.filter((e) => e.type === 'suggestion_click').length;
  const totalCopies = events.filter((e) => e.type === 'copy_action').length;
  const totalGoogleClicks = events.filter((e) => e.type === 'google_review_click').length;

  const viewsCount = Math.max(totalViews, 1);
  const conversionRate = Math.min(Math.round((totalCopies / viewsCount) * 100), 100);

  return {
    totalScans,
    totalViews,
    totalSuggestionClicks,
    totalCopies,
    totalGoogleClicks,
    conversionRate,
  };
};

export const seedDemoAnalytics = (slug = 'apex-pinhole-surgery'): void => {
  const existing = getStoredEvents();
  if (existing.length > 0) return;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const mockEvents: AnalyticsEvent[] = [];

  // Generate 14 days of realistic analytics
  for (let i = 14; i >= 0; i--) {
    const time = new Date(now - i * DAY_MS).toISOString();
    const scans = Math.floor(Math.random() * 5) + 3;
    
    for (let s = 0; s < scans; s++) {
      mockEvents.push({
        id: 'evt_demo_' + Math.random().toString(36).substring(2, 7),
        type: 'qr_scan',
        businessSlug: slug,
        timestamp: time,
      });
      mockEvents.push({
        id: 'evt_demo_' + Math.random().toString(36).substring(2, 7),
        type: 'page_view',
        businessSlug: slug,
        timestamp: time,
      });

      if (Math.random() > 0.3) {
        mockEvents.push({
          id: 'evt_demo_' + Math.random().toString(36).substring(2, 7),
          type: 'suggestion_click',
          businessSlug: slug,
          timestamp: time,
        });
        mockEvents.push({
          id: 'evt_demo_' + Math.random().toString(36).substring(2, 7),
          type: 'copy_action',
          businessSlug: slug,
          timestamp: time,
        });
        mockEvents.push({
          id: 'evt_demo_' + Math.random().toString(36).substring(2, 7),
          type: 'google_review_click',
          businessSlug: slug,
          timestamp: time,
        });
      }
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockEvents));
};
