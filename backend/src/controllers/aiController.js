import AIContentService from '../services/aiContentService.js';

const aiService = new AIContentService();

// Enhance content with AI suggestions
export const enhanceContent = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters long'
      });
    }

    const enhancement = await aiService.enhanceContent(content, title);
    
    res.json(enhancement);
  } catch (error) {
    console.error('Content enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance content',
      error: error.message
    });
  }
};

// Generate heading only
export const generateHeading = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const heading = await aiService.generateHeading(content);
    
    res.json({
      success: true,
      heading
    });
  } catch (error) {
    console.error('Heading generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate heading',
      error: error.message
    });
  }
};

// Check spelling and grammar
export const checkSpelling = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const errors = await aiService.checkSpelling(text);
    
    res.json({
      success: true,
      errors,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Spell check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check spelling',
      error: error.message
    });
  }
};

// Get content suggestions
export const getContentSuggestions = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const suggestions = await aiService.generateSuggestions(content, title);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions',
      error: error.message
    });
  }
};

// Get optimal posting time
export const getOptimalPostingTime = async (req, res) => {
  try {
    const postingTime = aiService.suggestPostingTime();
    
    res.json({
      success: true,
      ...postingTime
    });
  } catch (error) {
    console.error('Posting time error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest posting time',
      error: error.message
    });
  }
};

// Calculate SEO score
export const getSEOAnalysis = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const seoScore = aiService.calculateSEOScore(content, title || '');
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);

    res.json({
      success: true,
      seoScore,
      wordCount,
      readingTime: `${readingTime} min read`,
      recommendations: getSEORecommendations(seoScore, content, title)
    });
  } catch (error) {
    console.error('SEO analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze SEO',
      error: error.message
    });
  }
};

// Smart scheduling with AI optimization
export const scheduleSmartPost = async (req, res) => {
  try {
    const { content, title, scheduledTime } = req.body;

    if (!content || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Content and scheduled time are required'
      });
    }

    const scheduleResult = await aiService.scheduleSmartPost(content, title, req.user.id, scheduledTime);
    
    if (!scheduleResult.success) {
      return res.status(400).json(scheduleResult);
    }

    // Also provide content enhancement suggestions for the scheduled post
    const enhancement = await aiService.enhanceContent(content, title);
    
    res.json({
      success: true,
      scheduling: scheduleResult,
      contentAnalysis: enhancement,
      message: 'Smart scheduling configured successfully'
    });
  } catch (error) {
    console.error('Smart scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure smart scheduling',
      error: error.message
    });
  }
};

// Get AI-optimized posting times
export const getSmartPostingTimes = async (req, res) => {
  try {
    const { contentType, targetAudience } = req.query;
    
    // Get base posting time suggestions
    const basePostingTime = aiService.suggestPostingTime();
    
    // Enhanced suggestions based on content type and audience
    const smartSuggestions = {
      ...basePostingTime,
      contentOptimized: generateContentOptimizedTimes(contentType),
      audienceOptimized: generateAudienceOptimizedTimes(targetAudience)
    };
    
    res.json({
      success: true,
      ...smartSuggestions
    });
  } catch (error) {
    console.error('Smart posting times error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get smart posting times',
      error: error.message
    });
  }
};

// Helper function for content-optimized posting times
function generateContentOptimizedTimes(contentType) {
  const now = new Date();
  const suggestions = [];

  switch (contentType) {
    case 'tutorial':
    case 'educational':
      // Best times for educational content
      suggestions.push({
        time: getNextWeekdayTime(2, 9), // Tuesday 9 AM
        reason: 'Optimal for educational content consumption'
      });
      suggestions.push({
        time: getNextWeekdayTime(3, 14), // Wednesday 2 PM
        reason: 'Mid-week afternoon learning peak'
      });
      break;
    case 'news':
    case 'update':
      // Best times for news/updates
      suggestions.push({
        time: getNextWeekdayTime(1, 8), // Monday 8 AM
        reason: 'Start of week news consumption'
      });
      suggestions.push({
        time: getNextWeekdayTime(5, 17), // Friday 5 PM
        reason: 'End of week updates'
      });
      break;
    case 'entertainment':
    case 'lifestyle':
      // Best times for entertainment content
      suggestions.push({
        time: getNextWeekdayTime(6, 19), // Saturday 7 PM
        reason: 'Weekend leisure reading'
      });
      suggestions.push({
        time: getNextWeekdayTime(0, 15), // Sunday 3 PM
        reason: 'Sunday afternoon engagement'
      });
      break;
    default:
      // General content
      suggestions.push({
        time: getNextWeekdayTime(2, 10), // Tuesday 10 AM
        reason: 'General high-engagement time'
      });
  }

  return suggestions;
}

// Helper function for audience-optimized posting times
function generateAudienceOptimizedTimes(targetAudience) {
  const suggestions = [];

  switch (targetAudience) {
    case 'professionals':
    case 'business':
      suggestions.push({
        time: getNextWeekdayTime(2, 9), // Tuesday 9 AM
        reason: 'Professional peak engagement time'
      });
      suggestions.push({
        time: getNextWeekdayTime(4, 14), // Thursday 2 PM
        reason: 'Mid-week business focus'
      });
      break;
    case 'students':
    case 'academic':
      suggestions.push({
        time: getNextWeekdayTime(0, 16), // Sunday 4 PM
        reason: 'Student study time'
      });
      suggestions.push({
        time: getNextWeekdayTime(3, 20), // Wednesday 8 PM
        reason: 'Evening study sessions'
      });
      break;
    case 'general':
    default:
      suggestions.push({
        time: getNextWeekdayTime(2, 15), // Tuesday 3 PM
        reason: 'General audience peak time'
      });
      suggestions.push({
        time: getNextWeekdayTime(4, 19), // Thursday 7 PM
        reason: 'Evening engagement time'
      });
  }

  return suggestions;
}

// Helper to get next specific weekday and time
function getNextWeekdayTime(dayOfWeek, hour) {
  const now = new Date();
  const targetDay = dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
  const currentDay = now.getDay();
  
  let daysToAdd = (targetDay - currentDay + 7) % 7;
  if (daysToAdd === 0 && now.getHours() >= hour) {
    daysToAdd = 7; // Next week if today and time has passed
  }
  
  const nextDate = new Date();
  nextDate.setDate(now.getDate() + daysToAdd);
  nextDate.setHours(hour, 0, 0, 0);
  
  return nextDate.toISOString();
}

// Helper function for SEO recommendations
function getSEORecommendations(score, content, title) {
  const recommendations = [];
  const wordCount = content.split(' ').length;

  if (wordCount < 300) {
    recommendations.push('Increase content length to at least 300 words');
  }

  if (!title || title.length < 30) {
    recommendations.push('Create a more descriptive title (30-60 characters)');
  }

  if (!content.includes('?')) {
    recommendations.push('Add engaging questions to improve reader interaction');
  }

  const paragraphs = content.split('\n\n').filter(p => p.trim());
  if (paragraphs.length < 3) {
    recommendations.push('Break content into smaller paragraphs');
  }

  if (score < 70) {
    recommendations.push('Consider adding bullet points or numbered lists');
    recommendations.push('Include relevant keywords naturally in your content');
  }

  return recommendations;
}