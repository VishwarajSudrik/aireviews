// Utility helpers

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getAppBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  return metaEnv?.VITE_APP_URL || 'http://localhost:5173';
};

export const getReviewPageUrl = (slug: string): string => {
  return `${getAppBaseUrl()}/review/${slug}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    short: 'Short & Sweet',
    service_focused: 'Service Focused',
    professional_experience: 'Professional Experience',
    customer_experience: 'Customer Experience',
    natural_conversational: 'Natural & Conversational',
  };
  return labels[category] ?? category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    short: 'bg-blue-100 text-blue-700',
    service_focused: 'bg-purple-100 text-purple-700',
    professional_experience: 'bg-green-100 text-green-700',
    customer_experience: 'bg-amber-100 text-amber-700',
    natural_conversational: 'bg-rose-100 text-rose-700',
  };
  return colors[category] ?? 'bg-gray-100 text-gray-700';
};
