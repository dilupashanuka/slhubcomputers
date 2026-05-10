// =============================================================================
// SL HUB COMPUTER - AI Chat Helper Library
// =============================================================================
// Purpose: AI-powered chat response with FAQ matching and z-ai-web-dev-sdk
// Features:
//   - FAQ fuzzy matching using keyword extraction
//   - AI response generation via z-ai-web-dev-sdk
//   - Chat history context management (last 5 messages)
//   - Rate limiting per session per day
//   - Store context-aware system prompt
// =============================================================================

import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

interface ChatHistoryItem {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIChatResult {
  response: string;
  source: "faq" | "ai" | "fallback";
  faqId?: string;
}

// ---------------------------------------------------------------------------
// Store context for AI system prompt
// ---------------------------------------------------------------------------
const STORE_SYSTEM_PROMPT = `You are the AI assistant for SL HUB COMPUTER, a computer store in Deiyandara, Sri Lanka.

Store Information:
- Store Name: SL HUB COMPUTER
- Location: Hakmana Road, Deiyandara, Sri Lanka
- Phone: 071 067 8944
- WhatsApp: +94 71 067 8944
- Email: slhubcomputer@gmail.com
- Website: slhubcomputer.com
- Currency: LKR (Rs.)
- Business Hours: Mon-Sat 9AM-7PM, Sun 10AM-5PM

Services:
- Computer Parts & Accessories (processors, GPUs, RAM, storage, motherboards, PSUs, cases, etc.)
- Custom PC Building (budget, gaming, office, workstation builds)
- CCTV Installation & Security (Tiandy brand, home/business solutions)
- Computer & Laptop Repair (hardware, software, virus removal, data recovery)
- Mobile Accessories
- Software Solutions

Key Policies:
- Free shipping on orders over Rs. 25,000
- Shipping fee: Rs. 500 for orders under Rs. 25,000
- Payment methods: Cash on Delivery (COD), Bank Transfer
- 7-day return policy for eligible items
- All products are genuine with manufacturer warranty

Guidelines for responses:
1. Be friendly, helpful, and professional
2. Use Sri Lankan Rupees (Rs.) for prices
3. If asked about specific product prices, direct them to the website or suggest calling the store
4. For technical questions, provide helpful guidance but recommend visiting the store for complex issues
5. Keep responses concise but informative
6. If you don't know something specific, be honest and suggest contacting the store directly
7. Always mention business hours when relevant (Mon-Sat 9AM-7PM, Sun 10AM-5PM)
8. Never make up specific product prices or availability - direct to the store instead`;

// ---------------------------------------------------------------------------
// Keyword extraction - Simple but effective approach
// ---------------------------------------------------------------------------
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
    "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
    "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
    "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
    "about", "against", "between", "through", "during", "before", "after", "above",
    "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
    "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re",
    "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven",
    "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
    "won", "wouldn", "also", "would", "could", "please", "thanks", "thank",
    "hello", "hi", "hey", "good", "day", "want", "need", "know", "tell", "get",
    "got", "like", "much", "many", "any", "can", "may", "let",
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

// ---------------------------------------------------------------------------
// Fuzzy match against FAQs
// ---------------------------------------------------------------------------
function calculateMatchScore(queryKeywords: string[], faqKeywords: string[]): number {
  if (queryKeywords.length === 0 || faqKeywords.length === 0) return 0;

  let matches = 0;
  for (const qk of queryKeywords) {
    for (const fk of faqKeywords) {
      if (qk === fk) {
        matches += 2; // Exact match
      } else if (qk.includes(fk) || fk.includes(qk)) {
        matches += 1; // Partial match
      }
    }
  }

  // Normalize score
  return matches / Math.max(queryKeywords.length, 1);
}

// ---------------------------------------------------------------------------
// Load active FAQs with pre-computed keywords
// ---------------------------------------------------------------------------
async function loadFAQs(): Promise<FAQItem[]> {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      keywords: [
        ...extractKeywords(faq.question),
        ...extractKeywords(faq.answer),
      ],
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Match user query against FAQs - returns best match if score > threshold
// ---------------------------------------------------------------------------
export async function matchFAQ(query: string): Promise<FAQItem | null> {
  const faqs = await loadFAQs();
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0) return null;

  let bestMatch: FAQItem | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = calculateMatchScore(queryKeywords, faq.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Threshold: need at least 0.5 match score to consider it a FAQ match
  return bestScore >= 0.5 ? bestMatch : null;
}

// ---------------------------------------------------------------------------
// Get AI settings from database
// ---------------------------------------------------------------------------
export async function getAISettings() {
  try {
    let settings = await db.aISettings.findUnique({
      where: { id: "ai-settings" },
    });

    if (!settings) {
      settings = await db.aISettings.create({
        data: { id: "ai-settings" },
      });
    }

    return settings;
  } catch {
    // Return defaults if DB is not available
    return {
      enabled: true,
      model: "glm-4-flash",
      temperature: 0.7,
      welcomeMessage: "Hi! I'm SL HUB's AI assistant. How can I help you today? 😊",
      fallbackMessage: "I'm not sure about that. Let me connect you with our support team for more help.",
      maxMessagesPerDay: 20,
    };
  }
}

// ---------------------------------------------------------------------------
// Check rate limit for a session
// ---------------------------------------------------------------------------
export async function checkRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const settings = await getAISettings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aiMessagesToday = await db.chatMessage.count({
      where: {
        sessionId,
        sender: "ai_bot",
        createdAt: { gte: today },
      },
    });

    const remaining = Math.max(0, settings.maxMessagesPerDay - aiMessagesToday);
    return { allowed: aiMessagesToday < settings.maxMessagesPerDay, remaining };
  } catch {
    // If we can't check, allow the message
    return { allowed: true, remaining: 20 };
  }
}

// ---------------------------------------------------------------------------
// Generate AI response using z-ai-web-dev-sdk
// ---------------------------------------------------------------------------
export async function generateAIResponse(
  userMessage: string,
  chatHistory: ChatHistoryItem[]
): Promise<string> {
  try {
    const settings = await getAISettings();
    const zai = await ZAI.create();

    // Build messages array with context
    const messages: ChatHistoryItem[] = [
      { role: "system", content: STORE_SYSTEM_PROMPT },
      // Include last 5 messages for context
      ...chatHistory.slice(-5),
      { role: "user", content: userMessage },
    ];

    const response = await zai.chat.completions.create({
      model: settings.model || "glm-4-flash",
      messages,
      stream: false,
    });

    const aiMessage = response?.choices?.[0]?.message?.content;
    if (aiMessage && typeof aiMessage === "string") {
      return aiMessage.trim();
    }

    return settings.fallbackMessage;
  } catch (error) {
    console.error("AI response generation error:", error);
    return "I'm having trouble processing your request right now. Please try again or contact us directly at 071 067 8944.";
  }
}

// ---------------------------------------------------------------------------
// Main function: Process a chat message and return AI response
// ---------------------------------------------------------------------------
export async function processAIChat(
  userMessage: string,
  sessionId: string
): Promise<AIChatResult> {
  // Check rate limit
  const rateCheck = await checkRateLimit(sessionId);
  if (!rateCheck.allowed) {
    return {
      response: "You've reached the daily message limit for AI chat. Please contact our support team at 071 067 8944 for further assistance.",
      source: "fallback",
    };
  }

  // First try FAQ matching
  const faqMatch = await matchFAQ(userMessage);
  if (faqMatch) {
    return {
      response: faqMatch.answer,
      source: "faq",
      faqId: faqMatch.id,
    };
  }

  // Check if AI is enabled
  const settings = await getAISettings();
  if (!settings.enabled) {
    return {
      response: settings.fallbackMessage,
      source: "fallback",
    };
  }

  // Get chat history for context
  const recentMessages = await db.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const chatHistory: ChatHistoryItem[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.sender === "customer" ? "user" as const : "assistant" as const,
      content: msg.message,
    }));

  // Generate AI response
  const aiResponse = await generateAIResponse(userMessage, chatHistory);

  // If AI response is too generic or empty, use fallback
  if (!aiResponse || aiResponse.length < 10) {
    return {
      response: settings.fallbackMessage,
      source: "fallback",
    };
  }

  return {
    response: aiResponse,
    source: "ai",
  };
}
