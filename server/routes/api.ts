import { Router, Request, Response } from 'express';
import { generateReviewSuggestions } from '../services/geminiService.js';

const router = Router();

interface GenerateReviewsBody {
  businessName?: string;
  description?: string;
  category?: string;
  services?: string[];
  website?: string;
}

router.post('/generate-reviews', async (req: Request<{}, {}, GenerateReviewsBody>, res: Response) => {
  const { businessName, description, category, services, website } = req.body;

  // Validate required fields
  if (!businessName?.trim()) {
    return res.status(400).json({ success: false, message: 'Business name is required.' });
  }
  if (!description?.trim()) {
    return res.status(400).json({ success: false, message: 'Business description is required.' });
  }
  if (!category?.trim()) {
    return res.status(400).json({ success: false, message: 'Business category is required.' });
  }
  if (!services || services.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one service is required.' });
  }

  try {
    const reviews = await generateReviewSuggestions({
      businessName: businessName.trim(),
      description: description.trim(),
      category: category.trim(),
      services: services.filter(Boolean),
      website: website?.trim(),
    });

    return res.json({ success: true, reviews });
  } catch (err: unknown) {
    console.error('[/api/generate-reviews] Error:', err instanceof Error ? err.message : err);

    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('API key') || message.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact the administrator.',
      });
    }

    if (message.includes('quota') || message.includes('429')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit reached. Please wait a moment and try again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'We couldn\'t generate suggestions right now. Please try again in a moment.',
    });
  }
});

export default router;
