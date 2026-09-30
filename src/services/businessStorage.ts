import { Business, ReviewSuggestion } from '../types';
import { generateId, slugify } from './utils';

const STORAGE_KEY = 'reviewqr_businesses';

export { trackEvent } from './analyticsStorage';
export type { AnalyticsEvent } from './analyticsStorage';

export const generateAutomaticSuggestions = (data: {
  name: string;
  category: string;
  services: string[];
}): ReviewSuggestion[] => {
  const name = data.name;
  const s1 = data.services[0] || 'service';
  const s2 = data.services[1] || data.services[0] || 'care';
  const s3 = data.services[2] || data.services[0] || 'consultation';
  const catName = data.category || 'services';
  const now = new Date().toISOString();

  const categories: { cat: 'short' | 'service_focused' | 'professional_experience' | 'customer_experience' | 'natural_conversational'; texts: string[] }[] = [
    {
      cat: 'short',
      texts: [
        `Had a great experience with ${name}. Highly recommend their services!`,
        `Very pleased with the care and attention at ${name}.`,
        `Super smooth experience at ${name}. Professional from start to finish.`,
        `Outstanding quality and customer care at ${name}.`,
        `Five-star service from ${name}! Will definitely come back.`,
        `Clean, efficient, and friendly team at ${name}.`,
        `Great experience overall at ${name}. Very happy with the ${s1}.`,
        `Prompt, polite, and very knowledgeable team at ${name}.`,
        `So glad I chose ${name}. The results exceeded my expectations.`,
        `Exceptional ${s1} provided by ${name}. Highly recommended!`,
      ],
    },
    {
      cat: 'service_focused',
      texts: [
        `The ${s1} at ${name} was executed with impressive care and detail.`,
        `I used ${name} for ${s1}, and the entire team was knowledgeable and thorough.`,
        `If you need quality ${s1} or ${s2}, ${name} is definitely the place to go.`,
        `Top-notch ${s1}. ${name} delivered exactly what was promised.`,
        `Very satisfied with the ${s2} provided by ${name}.`,
        `The team at ${name} demonstrated true expertise during my ${s1}.`,
        `Extremely professional ${s1} and ${s3} experience at ${name}.`,
        `High standards and great results for ${s1} at ${name}.`,
        `They walked me through the entire ${s1} process clearly and patiently at ${name}.`,
        `Fantastic ${s2} quality from ${name}. I felt in expert hands the whole time.`,
      ],
    },
    {
      cat: 'professional_experience',
      texts: [
        `The team at ${name} is incredibly professional, attentive, and skilled.`,
        `From front desk to specialists, everyone at ${name} maintains the highest level of professionalism.`,
        `You can immediately tell the staff at ${name} take genuine pride in their work.`,
        `Professional, transparent, and trustworthy experience with ${name}.`,
        `I appreciated how clearly ${name} explained everything before proceeding.`,
        `Expert staff at ${name} answered all my questions with patience and clarity.`,
        `Clean environment, punctual appointments, and superb professionalism at ${name}.`,
        `Very impressed by the expertise and warm bedside manner at ${name}.`,
        `${name} sets the benchmark for professionalism in ${catName}.`,
        `Consistent quality and dedicated professional service every visit to ${name}.`,
      ],
    },
    {
      cat: 'customer_experience',
      texts: [
        `My overall experience with ${name} was smooth, comfortable, and stress-free.`,
        `They truly prioritize customer comfort and satisfaction at ${name}.`,
        `Friendly atmosphere and fantastic customer support at ${name}.`,
        `I was treated with kindness and care throughout my visit to ${name}.`,
        `Felt valued as a client from the moment I stepped into ${name}.`,
        `Quick turnarounds and excellent communication from ${name}.`,
        `The staff at ${name} went above and beyond to make my visit seamless.`,
        `Easy scheduling, zero wait time, and great customer care at ${name}.`,
        `I felt comfortable and well cared for throughout my experience with ${name}.`,
        `Refreshing customer-first approach at ${name}. I will be recommending them to family.`,
      ],
    },
    {
      cat: 'natural_conversational',
      texts: [
        `Honestly, ${name} is one of the best places around for ${s1}. So happy I found them!`,
        `If anyone is looking for reliable ${catName} help, give ${name} a try.`,
        `Just finished my visit at ${name} and couldn't be happier with how it went.`,
        `Huge shoutout to the team at ${name} for making things so easy for me today.`,
        `Had a really positive experience with ${name}. Definitely worth checking out.`,
        `If you want peace of mind with ${s1}, ${name} is the team to call.`,
        `Really smooth visit to ${name} today. Super friendly people!`,
        `Can't say enough good things about ${name}. 10/10 experience!`,
        `Tried ${name} for the first time for ${s1} and was thoroughly impressed.`,
        `Top recommendations for ${name}! Friendly staff and fantastic results.`,
      ],
    },
  ];

  const reviews: ReviewSuggestion[] = [];
  let idx = 1;
  for (const item of categories) {
    for (const txt of item.texts) {
      reviews.push({
        id: `review-${idx.toString().padStart(3, '0')}`,
        category: item.cat,
        text: txt,
        createdAt: now,
        updatedAt: now,
      });
      idx++;
    }
  }
  return reviews;
};

export const getAllBusinesses = (): Business[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Business[]) : [];
  } catch {
    return [];
  }
};

export const getBusinessById = (id: string): Business | undefined => {
  const biz = getAllBusinesses().find((b) => b.id === id);
  if (!biz) return undefined;
  if (!biz.reviewSuggestions || biz.reviewSuggestions.length === 0) {
    biz.reviewSuggestions = generateAutomaticSuggestions({
      name: biz.name,
      category: biz.category,
      services: biz.services || [],
    });
    saveBusiness(biz);
  }
  return biz;
};

export const getBusinessBySlug = (slug: string): Business | undefined => {
  if (!slug) return undefined;
  seedDemoData();
  const businesses = getAllBusinesses();
  const normalized = slugify(slug);

  let biz = businesses.find(
    (b) =>
      b.slug === slug ||
      b.slug.toLowerCase() === slug.toLowerCase() ||
      slugify(b.slug) === normalized ||
      (normalized.includes('apex-pinhole') && (b.slug.includes('apex-pinhole') || b.id === 'demo-apex-001')) ||
      b.id === slug
  );

  if (!biz) {
    const isApex = slug.toLowerCase().includes('apex-pinhole');
    const formattedName = isApex
      ? 'Apex Pinhole Surgery Clinic'
      : slug
          .replace(/[-_]+/g, ' ')
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

    const fallbackBiz: Business = {
      id: `auto-${slug}`,
      name: formattedName || 'Business Review',
      slug: slug,
      logo: '',
      description: isApex
        ? 'Apex Pinhole Surgery Clinic specializes in minimally invasive gum recession treatment using the Chao Pinhole Surgical Technique. We help patients restore healthy gum tissue without traditional grafting surgery, providing faster recovery and exceptional results.'
        : `Welcome to ${formattedName || 'our business'}! Please share your valuable experience with us below.`,
      category: isApex ? 'Healthcare' : 'Customer Experience',
      website: '',
      phone: '',
      email: '',
      address: '',
      services: isApex
        ? ['Pinhole Surgical Technique', 'Gum Recession Treatment', 'Oral Health Assessment']
        : ['Quality Service', 'Customer Care', 'Client Satisfaction'],
      googleReviewUrl: isApex
        ? 'https://g.page/r/CboKm_IknM-QEBM/review'
        : `https://www.google.com/search?q=${encodeURIComponent((formattedName || 'Business') + ' reviews write a review')}`,
      reviewSuggestions: generateAutomaticSuggestions({
        name: formattedName || 'our business',
        category: isApex ? 'Healthcare' : 'Customer Experience',
        services: isApex
          ? ['Pinhole Surgical Technique', 'Gum Recession Treatment', 'Oral Health Assessment']
          : ['Quality Service', 'Customer Care', 'Client Satisfaction'],
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBusiness(fallbackBiz);
    return fallbackBiz;
  }

  if (!biz.reviewSuggestions || biz.reviewSuggestions.length === 0) {
    biz.reviewSuggestions = generateAutomaticSuggestions({
      name: biz.name,
      category: biz.category,
      services: biz.services || [],
    });
    saveBusiness(biz);
  }

  return biz;
};

export const saveBusiness = (business: Business): Business => {
  const businesses = getAllBusinesses();
  const index = businesses.findIndex((b) => b.id === business.id);
  const now = new Date().toISOString();

  if (index >= 0) {
    businesses[index] = { ...business, updatedAt: now };
  } else {
    businesses.push({ ...business, createdAt: now, updatedAt: now });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  return businesses[index >= 0 ? index : businesses.length - 1];
};

export const deleteBusiness = (id: string): void => {
  const businesses = getAllBusinesses().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
};

export const createBusiness = (data: Omit<Business, 'id' | 'reviewSuggestions' | 'createdAt' | 'updatedAt'>): Business => {
  const now = new Date().toISOString();
  const suggestions = generateAutomaticSuggestions({
    name: data.name,
    category: data.category,
    services: data.services || [],
  });

  const business: Business = {
    ...data,
    id: generateId(),
    reviewSuggestions: suggestions,
    createdAt: now,
    updatedAt: now,
  };
  saveBusiness(business);
  return business;
};

export const updateBusinessReviews = (businessId: string, reviews: ReviewSuggestion[]): Business | null => {
  const business = getBusinessById(businessId);
  if (!business) return null;

  const updated: Business = {
    ...business,
    reviewSuggestions: reviews,
    updatedAt: new Date().toISOString(),
  };
  saveBusiness(updated);
  return updated;
};

export const slugExists = (slug: string, excludeId?: string): boolean => {
  return getAllBusinesses().some((b) => b.slug === slug && b.id !== excludeId);
};

// Demo data seed
export const seedDemoData = (): void => {
  const businesses = getAllBusinesses();
  const demoName = 'Apex Pinhole Surgery Clinic';
  const demoUrl = 'https://g.page/r/CboKm_IknM-QEBM/review';
  const demoServices = [
    'Pinhole Surgical Technique',
    'Gum Recession Treatment',
    'Gum Tissue Restoration',
    'Dental Consultation',
    'Oral Health Assessment',
    'Minimally Invasive Periodontal Care',
  ];

  const existingIndex = businesses.findIndex(
    (b) =>
      b.id === 'demo-apex-001' ||
      b.slug === 'apex-pinhole-surgery' ||
      b.slug === 'apex-pinhole-surgery-clinic' ||
      b.name.toLowerCase().includes('apex pinhole')
  );

  if (existingIndex >= 0) {
    const existing = businesses[existingIndex];
    if (existing.googleReviewUrl !== demoUrl || existing.name !== demoName) {
      businesses[existingIndex] = {
        ...existing,
        name: demoName,
        googleReviewUrl: demoUrl,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
    }
    return;
  }

  const demo: Business = {
    id: 'demo-apex-001',
    name: demoName,
    slug: 'apex-pinhole-surgery',
    logo: '',
    description:
      'Apex Pinhole Surgery Clinic specializes in minimally invasive gum recession treatment using the Chao Pinhole Surgical Technique. We help patients restore healthy gum tissue without traditional grafting surgery, providing faster recovery and exceptional results.',
    category: 'Healthcare',
    website: 'https://apexpinholeexample.com',
    phone: '(555) 123-4567',
    email: 'info@apexpinholeexample.com',
    address: '123 Dental Way, Los Angeles, CA 90001',
    services: demoServices,
    googleReviewUrl: demoUrl,
    reviewSuggestions: generateAutomaticSuggestions({
      name: demoName,
      category: 'Healthcare',
      services: demoServices,
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveBusiness(demo);
};
