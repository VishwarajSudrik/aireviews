export interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  category: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  googleReviewUrl: string;
  yelpReviewUrl?: string;
  facebookReviewUrl?: string;
  trustpilotReviewUrl?: string;
  reviewSuggestions: ReviewSuggestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSuggestion {
  id: string;
  category: ReviewCategory;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewCategory =
  | 'short'
  | 'service_focused'
  | 'professional_experience'
  | 'customer_experience'
  | 'natural_conversational';

export interface GenerateReviewsRequest {
  businessName: string;
  description: string;
  category: string;
  services: string[];
  website?: string;
}

export interface GenerateReviewsResponse {
  success: boolean;
  reviews?: ReviewSuggestion[];
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
