import { GenerateReviewsRequest, GenerateReviewsResponse, ReviewSuggestion } from '../types';
import { generateId } from './utils';

const generateClientFallback = (data: GenerateReviewsRequest): ReviewSuggestion[] => {
  const name = data.businessName;
  const s1 = data.services[0] || 'service';
  const s2 = data.services[1] || data.services[0] || 'care';
  const s3 = data.services[2] || data.services[0] || 'consultation';
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
        `${name} sets the benchmark for professionalism in ${data.category}.`,
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
        `If anyone is looking for reliable ${data.category} help, give ${name} a try.`,
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

export const generateReviewSuggestions = async (
  data: GenerateReviewsRequest
): Promise<GenerateReviewsResponse> => {
  try {
    const response = await fetch('/api/generate-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.reviews && resData.reviews.length > 0) {
        return resData;
      }
    }

    console.warn('[reviewApi] Server API returned non-200 or empty data, using fallback generator.');
    return {
      success: true,
      reviews: generateClientFallback(data),
    };
  } catch (err) {
    console.warn('[reviewApi] Network request failed, using client fallback generator.');
    return {
      success: true,
      reviews: generateClientFallback(data),
    };
  }
};
