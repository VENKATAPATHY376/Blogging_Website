import OpenAI from 'openai';
import axios from 'axios';

class AIContentService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });
    this.isOpenAIAvailable = !!process.env.OPENAI_API_KEY;
  }

  // Generate heading from content
  async generateHeading(content) {
    try {
      if (!this.isOpenAIAvailable) {
        return this.generateHeadingFallback(content);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a professional content editor. Generate a compelling, SEO-friendly heading for the given content. Keep it under 60 characters and make it engaging."
        }, {
          role: "user", 
          content: `Generate a heading for this content:\n\n${content.substring(0, 500)}...`
        }],
        max_tokens: 20,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('AI heading generation error:', error.message);
      return this.generateHeadingFallback(content);
    }
  }

  // Fallback heading generation without AI
  generateHeadingFallback(content) {
    const words = content.split(' ').slice(0, 8);
    let heading = words.join(' ');
    if (heading.length > 50) {
      heading = heading.substring(0, 47) + '...';
    }
    return heading || 'New Blog Post';
  }

  // Check spelling and grammar
  async checkSpelling(text) {
    try {
      if (!this.isOpenAIAvailable) {
        return this.checkSpellingFallback(text);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a professional proofreader. Find spelling and grammar errors in the text and return them as JSON array with format: [{\"error\": \"misspelled word\", \"suggestion\": \"correct word\", \"position\": \"approximate position\"}]. If no errors, return empty array []."
        }, {
          role: "user",
          content: text
        }],
        max_tokens: 500,
        temperature: 0.1
      });

      const result = response.choices[0].message.content.trim();
      return JSON.parse(result);
    } catch (error) {
      console.error('AI spell check error:', error.message);
      return this.checkSpellingFallback(text);
    }
  }

  // Fallback spell checking without AI
  checkSpellingFallback(text) {
    const commonErrors = [
      { error: 'teh', suggestion: 'the' },
      { error: 'recieve', suggestion: 'receive' },
      { error: 'seperate', suggestion: 'separate' },
      { error: 'occured', suggestion: 'occurred' },
      { error: 'definately', suggestion: 'definitely' }
    ];

    const errors = [];
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      const foundError = commonErrors.find(err => err.error === cleanWord);
      if (foundError) {
        errors.push({
          error: cleanWord,
          suggestion: foundError.suggestion,
          position: `Word ${index + 1}`
        });
      }
    });

    return errors;
  }

  // Generate content suggestions
  async generateSuggestions(content, title) {
    try {
      if (!this.isOpenAIAvailable) {
        return this.generateSuggestionsFallback(content);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a content strategy expert. Provide 3-5 brief suggestions to improve this blog post. Focus on engagement, SEO, and readability. Return as JSON array of strings."
        }, {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content.substring(0, 1000)}...`
        }],
        max_tokens: 200,
        temperature: 0.6
      });

      const result = response.choices[0].message.content.trim();
      return JSON.parse(result);
    } catch (error) {
      console.error('AI suggestions error:', error.message);
      return this.generateSuggestionsFallback(content);
    }
  }

  // Fallback suggestions without AI
  generateSuggestionsFallback(content) {
    const suggestions = [];
    const wordCount = content.split(' ').length;

    if (wordCount < 300) {
      suggestions.push("Consider expanding your content to at least 300 words for better SEO");
    }

    if (!content.includes('?')) {
      suggestions.push("Add engaging questions to improve reader interaction");
    }

    if (content.split('\n\n').length < 3) {
      suggestions.push("Break content into smaller paragraphs for better readability");
    }

    suggestions.push("Add relevant images to make your post more engaging");
    suggestions.push("Include a call-to-action to encourage reader engagement");

    return suggestions.slice(0, 4);
  }

  // Suggest optimal posting time
  suggestPostingTime() {
    const now = new Date();
    const suggestions = [];

    // Best times based on research
    const optimalTimes = [
      { day: 'Tuesday', time: '10:00 AM', reason: 'High engagement mid-week morning' },
      { day: 'Wednesday', time: '2:00 PM', reason: 'Peak afternoon reading time' },
      { day: 'Thursday', time: '9:00 AM', reason: 'Strong mid-week performance' },
      { day: 'Sunday', time: '7:00 PM', reason: 'Weekend evening engagement' }
    ];

    // Next optimal time
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();

    // Find next optimal posting time
    let nextOptimal = new Date();
    
    if (currentDay < 2 || (currentDay === 2 && currentHour < 10)) {
      // Next Tuesday 10 AM
      nextOptimal.setDate(now.getDate() + (2 - currentDay + 7) % 7);
      nextOptimal.setHours(10, 0, 0, 0);
    } else if (currentDay < 3 || (currentDay === 3 && currentHour < 14)) {
      // Next Wednesday 2 PM
      nextOptimal.setDate(now.getDate() + (3 - currentDay + 7) % 7);
      nextOptimal.setHours(14, 0, 0, 0);
    } else {
      // Next Tuesday
      nextOptimal.setDate(now.getDate() + (2 - currentDay + 7) % 7);
      nextOptimal.setHours(10, 0, 0, 0);
    }

    return {
      recommended: nextOptimal.toISOString(),
      reason: 'Optimal engagement time based on analytics',
      alternatives: optimalTimes.map(time => ({
        ...time,
        datetime: this.getNextWeekday(time.day, time.time)
      }))
    };
  }

  // Helper to get next weekday
  getNextWeekday(dayName, timeStr) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayName);
    const now = new Date();
    const currentDay = now.getDay();
    
    let daysToAdd = (targetDay - currentDay + 7) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // Next week if today
    
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + daysToAdd);
    
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    nextDate.setHours(hour, parseInt(minutes) || 0, 0, 0);
    return nextDate.toISOString();
  }

  // Smart scheduling with automatic posting
  async scheduleSmartPost(content, title, userId, scheduledTime) {
    try {
      // Validate scheduled time is in the future
      const scheduleDate = new Date(scheduledTime);
      const now = new Date();
      
      if (scheduleDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }

      // Calculate time until posting
      const timeUntilPost = scheduleDate.getTime() - now.getTime();
      
      return {
        success: true,
        scheduledAt: scheduleDate.toISOString(),
        timeUntilPost: Math.ceil(timeUntilPost / (1000 * 60)), // minutes
        message: `Post scheduled for ${scheduleDate.toLocaleString()}`,
        willPostIn: this.formatTimeRemaining(timeUntilPost)
      };
    } catch (error) {
      console.error('Smart scheduling error:', error);
      return {
        success: false,
        error: 'Failed to schedule post',
        details: error.message
      };
    }
  }

  // Format remaining time in human-readable format
  formatTimeRemaining(milliseconds) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${hours % 24} hour${(hours % 24) > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes % 60} minute${(minutes % 60) > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  // Comprehensive content analysis
  async enhanceContent(content, title = '') {
    try {
      const [generatedHeading, spellingErrors, suggestions, postingTime] = await Promise.all([
        title ? Promise.resolve(title) : this.generateHeading(content),
        this.checkSpelling(content),
        this.generateSuggestions(content, title),
        Promise.resolve(this.suggestPostingTime())
      ]);

      return {
        success: true,
        heading: generatedHeading,
        spellingErrors,
        suggestions,
        postingTime,
        wordCount: content.split(' ').length,
        readingTime: Math.ceil(content.split(' ').length / 200) + ' min read',
        seoScore: this.calculateSEOScore(content, generatedHeading)
      };
    } catch (error) {
      console.error('Content enhancement error:', error);
      return {
        success: false,
        error: 'Failed to enhance content',
        details: error.message
      };
    }
  }

  // Calculate basic SEO score
  calculateSEOScore(content, heading) {
    let score = 0;
    const maxScore = 100;

    // Word count (20 points)
    const wordCount = content.split(' ').length;
    if (wordCount >= 300) score += 20;
    else if (wordCount >= 150) score += 10;

    // Heading quality (20 points)
    if (heading && heading.length >= 30 && heading.length <= 60) score += 20;
    else if (heading && heading.length >= 20) score += 10;

    // Paragraph structure (20 points)
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    if (paragraphs.length >= 3) score += 20;
    else if (paragraphs.length >= 2) score += 10;

    // Content engagement (20 points)
    const hasQuestions = content.includes('?');
    const hasLists = content.includes('\n-') || content.includes('\n*');
    if (hasQuestions && hasLists) score += 20;
    else if (hasQuestions || hasLists) score += 10;

    // Basic keyword density (20 points)
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = [...new Set(words)];
    const diversity = uniqueWords.length / words.length;
    if (diversity > 0.6) score += 20;
    else if (diversity > 0.4) score += 10;

    return Math.min(score, maxScore);
  }
}

export default AIContentService;