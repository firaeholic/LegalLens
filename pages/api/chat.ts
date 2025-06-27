import type { NextApiRequest, NextApiResponse } from 'next'

interface ChatResponse {
  answer?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, context } = req.body

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'No question provided' })
    }

    if (!context || typeof context !== 'string') {
      return res.status(400).json({ error: 'No document context provided' })
    }

    // Try multiple free AI services for chat functionality
    let answer = ''
    
    try {
      // First try: Free AI APIs
      answer = await generateAnswerWithFreeAPI(question, context)
    } catch (error) {
      console.log('Free API failed, using rule-based chat:', error)
      // Fallback: Rule-based Q&A
      answer = await generateRuleBasedAnswer(question, context)
    }

    if (!answer.trim()) {
      return res.status(500).json({ error: 'Failed to generate answer' })
    }

    res.status(200).json({ answer })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process chat request' })
  }
}

// Try free AI APIs (Hugging Face, Groq, etc.)
async function generateAnswerWithFreeAPI(question: string, context: string): Promise<string> {
  // You can integrate with free services like:
  // - Hugging Face Inference API
  // - Groq (free tier)
  // - Together AI (free tier)
  // - Cohere (free tier)
  
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
  
  if (HF_API_KEY) {
    try {
      return await generateAnswerWithHuggingFace(question, context, HF_API_KEY)
    } catch (error) {
      console.log('Hugging Face chat failed:', error)
    }
  }
  
  throw new Error('No free AI service available')
}

// Hugging Face Q&A model
async function generateAnswerWithHuggingFace(question: string, context: string, apiKey: string): Promise<string> {
  const API_URL = 'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2'
  
  // Truncate context if too long
  const truncatedContext = context.length > 2000 ? context.substring(0, 2000) + '...' : context
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        question: question,
        context: truncatedContext
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.error) {
    throw new Error(result.error)
  }
  
  return result.answer || 'I could not find a specific answer to your question in the document.'
}

// Fallback: Rule-based Q&A system
async function generateRuleBasedAnswer(question: string, context: string): Promise<string> {
  const lowerQuestion = question.toLowerCase()
  const lowerContext = context.toLowerCase()
  
  // Define question patterns and response strategies
  const questionPatterns = [
    {
      patterns: ['what are', 'what is', 'define', 'explain'],
      type: 'definition',
      handler: (q: string, c: string) => findDefinitions(q, c)
    },
    {
      patterns: ['who is', 'who are', 'which party', 'parties'],
      type: 'parties',
      handler: (q: string, c: string) => findParties(q, c)
    },
    {
      patterns: ['when', 'what date', 'how long', 'duration'],
      type: 'timing',
      handler: (q: string, c: string) => findTiming(q, c)
    },
    {
      patterns: ['how much', 'cost', 'price', 'fee', 'payment'],
      type: 'financial',
      handler: (q: string, c: string) => findFinancialTerms(q, c)
    },
    {
      patterns: ['risk', 'danger', 'liability', 'penalty'],
      type: 'risk',
      handler: (q: string, c: string) => findRisks(q, c)
    },
    {
      patterns: ['terminate', 'end', 'cancel', 'exit'],
      type: 'termination',
      handler: (q: string, c: string) => findTermination(q, c)
    },
    {
      patterns: ['obligation', 'responsibility', 'duty', 'must'],
      type: 'obligations',
      handler: (q: string, c: string) => findObligations(q, c)
    },
    {
      patterns: ['warranty', 'guarantee', 'protection'],
      type: 'warranties',
      handler: (q: string, c: string) => findWarranties(q, c)
    }
  ]
  
  // Find matching pattern
  let matchedPattern = null
  for (const pattern of questionPatterns) {
    if (pattern.patterns.some(p => lowerQuestion.includes(p))) {
      matchedPattern = pattern
      break
    }
  }
  
  if (matchedPattern) {
    const answer = matchedPattern.handler(lowerQuestion, context)
    if (answer) {
      return answer
    }
  }
  
  // Fallback: Extract relevant sentences
  return extractRelevantSentences(question, context)
}

// Find definitions in the document
function findDefinitions(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const definitionSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('means') || lower.includes('defined as') || 
           lower.includes('refers to') || lower.includes('shall mean')
  })
  
  if (definitionSentences.length > 0) {
    return `Based on the document, here are the relevant definitions:\n\n${definitionSentences.slice(0, 3).join('. ')}.`
  }
  
  return ''
}

// Find parties mentioned in the document
function findParties(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const partySentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('party') || lower.includes('client') || 
           lower.includes('contractor') || lower.includes('company') ||
           lower.includes('agreement between')
  })
  
  if (partySentences.length > 0) {
    return `The parties involved in this agreement are:\n\n${partySentences.slice(0, 2).join('. ')}.`
  }
  
  return 'I could not clearly identify the specific parties from the document text.'
}

// Find timing and duration information
function findTiming(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const timingSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('days') || lower.includes('months') || 
           lower.includes('years') || lower.includes('date') ||
           lower.includes('within') || lower.includes('duration') ||
           lower.includes('term')
  })
  
  if (timingSentences.length > 0) {
    return `Here are the timing-related terms from the document:\n\n${timingSentences.slice(0, 3).join('. ')}.`
  }
  
  return 'I could not find specific timing or duration information in the document.'
}

// Find financial terms
function findFinancialTerms(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const financialSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('$') || lower.includes('payment') || 
           lower.includes('fee') || lower.includes('cost') ||
           lower.includes('price') || lower.includes('compensation') ||
           lower.includes('salary') || lower.includes('rate')
  })
  
  if (financialSentences.length > 0) {
    return `Here are the financial terms mentioned in the document:\n\n${financialSentences.slice(0, 3).join('. ')}.`
  }
  
  return 'I could not find specific financial terms or payment information in the document.'
}

// Find risk-related information
function findRisks(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const riskSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('liability') || lower.includes('risk') || 
           lower.includes('penalty') || lower.includes('damages') ||
           lower.includes('indemnif') || lower.includes('waive') ||
           lower.includes('disclaim')
  })
  
  if (riskSentences.length > 0) {
    return `Here are the risk-related clauses I found:\n\n${riskSentences.slice(0, 3).join('. ')}. \n\nPlease review these carefully as they may affect your liability and obligations.`
  }
  
  return 'I did not find any obvious risk-related clauses in the document, but I recommend having a legal professional review the full document.'
}

// Find termination information
function findTermination(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const terminationSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('terminat') || lower.includes('end') || 
           lower.includes('cancel') || lower.includes('expire') ||
           lower.includes('breach')
  })
  
  if (terminationSentences.length > 0) {
    return `Here's what the document says about termination:\n\n${terminationSentences.slice(0, 3).join('. ')}.`
  }
  
  return 'I could not find specific termination clauses in the document.'
}

// Find obligations and responsibilities
function findObligations(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const obligationSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('shall') || lower.includes('must') || 
           lower.includes('required') || lower.includes('obligation') ||
           lower.includes('responsible') || lower.includes('duty')
  })
  
  if (obligationSentences.length > 0) {
    return `Here are the key obligations mentioned in the document:\n\n${obligationSentences.slice(0, 3).join('. ')}.`
  }
  
  return 'I could not find specific obligations clearly stated in the document.'
}

// Find warranty information
function findWarranties(question: string, context: string): string {
  const sentences = context.split(/[.!?]+/)
  const warrantySentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase()
    return lower.includes('warrant') || lower.includes('guarantee') || 
           lower.includes('represent') || lower.includes('assure') ||
           lower.includes('promise')
  })
  
  if (warrantySentences.length > 0) {
    return `Here's what the document says about warranties and guarantees:\n\n${warrantySentences.slice(0, 3).join('. ')}.`
  }
  
  return 'I could not find specific warranty or guarantee clauses in the document.'
}

// Extract sentences most relevant to the question
function extractRelevantSentences(question: string, context: string): string {
  const questionWords = question.toLowerCase().split(/\s+/).filter(word => 
    word.length > 3 && !['what', 'when', 'where', 'how', 'why', 'does', 'will', 'can', 'the', 'and', 'or'].includes(word)
  )
  
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Score sentences based on keyword matches
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase()
    let score = 0
    
    questionWords.forEach(word => {
      if (lowerSentence.includes(word)) {
        score += 1
      }
    })
    
    return { sentence: sentence.trim(), score }
  })
  
  // Get top scoring sentences
  const relevantSentences = scoredSentences
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.sentence)
  
  if (relevantSentences.length > 0) {
    return `Based on your question, here are the most relevant parts of the document:\n\n${relevantSentences.join('. ')}.`
  }
  
  return "I couldn't find information directly related to your question in the document. Could you try rephrasing your question or asking about specific terms mentioned in the document?"
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}