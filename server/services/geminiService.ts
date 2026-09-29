import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewSuggestion } from '../../src/types/index.js';

interface BusinessData {
  businessName: string;
  description: string;
  category: string;
  services: string[];
  website?: string;
}

const buildPrompt = (data: BusinessData): string => `
You are an expert review writing assistant. Your task is to create AI-assisted review STARTING POINTS for a local business.

IMPORTANT RULES:
- These are starting points for real customers to personalize, NOT fake reviews
- Do NOT invent specific experiences, names, dates, or statistics
- Do NOT make medical claims, promises of outcomes, or exaggerated statements
- Keep each review natural, human-sounding, and grammatically correct
- Each review must be unique and distinct from others
- Base suggestions only on the provided business information
- Avoid spam-like language and overly promotional phrasing

BUSINESS INFORMATION:
- Business Name: ${data.businessName}
- Category: ${data.category}
- Description: ${data.description}
- Services Offered: ${data.services.join(', ')}
${data.website ? `- Website: ${data.website}` : ''}

Generate exactly 50 review suggestions divided into 5 categories of 10 each:

1. **short** (10 suggestions): Brief 1-2 sentence reviews. Simple, genuine, easy to read.
2. **service_focused** (10 suggestions): Focus on specific services offered, their quality, and professionalism.
3. **professional_experience** (10 suggestions): Emphasize professionalism, expertise, staff quality, and trust.
4. **customer_experience** (10 suggestions): Focus on the overall experience — comfort, ease, communication, results.
5. **natural_conversational** (10 suggestions): Casual, conversational tone, as if talking to a friend.

Return a valid JSON object in this exact format with no markdown code blocks:
{
  "reviews": [
    {
      "id": "review-001",
      "category": "short",
      "text": "The review suggestion text here."
    }
  ]
}

Use sequential IDs: review-001, review-002, ..., review-050.
Ensure all 50 reviews are included.
`;

export const generateFallbackSuggestions = (data: BusinessData): ReviewSuggestion[] => {
  const name = data.businessName;
  const s1 = data.services[0] || 'service';
  const s2 = data.services[1] || data.services[0] || 'care';
  const s3 = data.services[2] || data.services[0] || 'consultation';
  const now = new Date().toISOString();

  const shortTexts = [
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
  ];

  const serviceTexts = [
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
  ];

  const professionalTexts = [
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
  ];

  const customerTexts = [
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
  ];

  const conversationalTexts = [
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
  ];

  const categories: { cat: 'short' | 'service_focused' | 'professional_experience' | 'customer_experience' | 'natural_conversational'; texts: string[] }[] = [
    { cat: 'short', texts: shortTexts },
    { cat: 'service_focused', texts: serviceTexts },
    { cat: 'professional_experience', texts: professionalTexts },
    { cat: 'customer_experience', texts: customerTexts },
    { cat: 'natural_conversational', texts: conversationalTexts },
  ];

  const reviews: ReviewSuggestion[] = [];
  let index = 1;

  for (const item of categories) {
    for (const txt of item.texts) {
      const idStr = `review-${index.toString().padStart(3, '0')}`;
      reviews.push({
        id: idStr,
        category: item.cat,
        text: txt,
        createdAt: now,
        updatedAt: now,
      });
      index++;
    }
  }

  return reviews;
};

export const generateReviewSuggestions = async (
  data: BusinessData
): Promise<ReviewSuggestion[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.length < 15 || apiKey.startsWith('AQ.')) {
    console.warn('[Gemini AI] Invalid or missing API key. Operating with dynamic AI template fallback.');
    return generateFallbackSuggestions(data);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(data);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let parsed: { reviews: ReviewSuggestion[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Failed to parse Gemini response as JSON.');
      parsed = JSON.parse(match[0]);
    }

    if (!parsed.reviews || !Array.isArray(parsed.reviews) || parsed.reviews.length === 0) {
      throw new Error('Invalid response structure from Gemini.');
    }

    return parsed.reviews;
  } catch (err) {
    console.warn('[Gemini AI] Call failed, switching to dynamic fallback generator:', err instanceof Error ? err.message : err);
    return generateFallbackSuggestions(data);
  }
};
