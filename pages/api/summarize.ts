import type { NextApiRequest, NextApiResponse } from 'next'

interface SummarizeResponse {
  summary?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummarizeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'No text provided for summarization' })
    }

    if (text.length < 50) {
      return res.status(400).json({ error: 'Text too short for meaningful summarization' })
    }

    // Try multiple free AI services in order of preference
    let summary = ''
    
    try {
      // First try: Hugging Face Inference API (free tier)
      summary = await summarizeWithHuggingFace(text)
    } catch (error) {
      console.log('Hugging Face failed, trying fallback:', error)
      try {
        // Second try: OpenAI-compatible free services
        summary = await summarizeWithFreeAPI(text)
      } catch (error2) {
        console.log('Free API failed, using rule-based summarization:', error2)
        // Fallback: Rule-based summarization
        summary = await ruleBasedSummarization(text)
      }
    }

    if (!summary.trim()) {
      return res.status(500).json({ error: 'Failed to generate summary' })
    }

    res.status(200).json({ summary })
  } catch (error) {
    console.error('Summarization error:', error)
    res.status(500).json({ error: 'Failed to process summarization request' })
  }
}

// Try Hugging Face Inference API (free tier)
async function summarizeWithHuggingFace(text: string): Promise<string> {
  // Note: In production, you would use a real Hugging Face API key
  // For demo purposes, we'll simulate the response
  
  const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
  
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured')
  }

  // Truncate text if too long (BART has token limits)
  const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: truncatedText,
      parameters: {
        max_length: 150,
        min_length: 50,
        do_sample: false
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
  
  return result[0]?.summary_text || result.summary_text || ''
}

// Try free OpenAI-compatible APIs
async function summarizeWithFreeAPI(text: string): Promise<string> {
  // You can use services like:
  // - Together AI (free tier)
  // - Replicate (free tier)
  // - Groq (free tier)
  // For demo, we'll simulate a response
  
  throw new Error('Free API not configured')
}

// Fallback: Rule-based summarization
async function ruleBasedSummarization(text: string): Promise<string> {
  // Simple extractive summarization
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  if (sentences.length === 0) {
    return 'Unable to generate summary from the provided text.'
  }

  // Score sentences based on keywords and position
  const legalKeywords = [
    'agreement', 'contract', 'party', 'parties', 'terms', 'conditions',
    'payment', 'liability', 'warranty', 'termination', 'breach',
    'confidentiality', 'intellectual property', 'indemnification',
    'governing law', 'jurisdiction', 'dispute', 'arbitration',
    'force majeure', 'assignment', 'modification', 'severability'
  ]

  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0
    const lowerSentence = sentence.toLowerCase()
    
    // Keyword scoring
    legalKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 2
      }
    })
    
    // Position scoring (first and last sentences are important)
    if (index === 0 || index === sentences.length - 1) {
      score += 3
    }
    
    // Length scoring (prefer medium-length sentences)
    if (sentence.length > 50 && sentence.length < 200) {
      score += 1
    }
    
    return { sentence: sentence.trim(), score, index }
  })

  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)))
    .sort((a, b) => a.index - b.index) // Restore original order
    .map(item => item.sentence)

  let summary = topSentences.join('. ')
  
  // Add context if we have legal document indicators
  const hasLegalTerms = legalKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  )
  
  if (hasLegalTerms) {
    const documentType = identifyDocumentType(text)
    summary = `This appears to be ${documentType}. ${summary}`
  }
  
  // Ensure summary ends properly
  if (!summary.endsWith('.')) {
    summary += '.'
  }
  
  return summary
}

// Identify document type based on content
function identifyDocumentType(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('employment') || lowerText.includes('employee')) {
    return 'an employment agreement'
  }
  if (lowerText.includes('service') && lowerText.includes('agreement')) {
    return 'a service agreement'
  }
  if (lowerText.includes('lease') || lowerText.includes('rental')) {
    return 'a lease agreement'
  }
  if (lowerText.includes('purchase') || lowerText.includes('sale')) {
    return 'a purchase agreement'
  }
  if (lowerText.includes('license') || lowerText.includes('licensing')) {
    return 'a licensing agreement'
  }
  if (lowerText.includes('confidentiality') || lowerText.includes('non-disclosure')) {
    return 'a confidentiality agreement'
  }
  if (lowerText.includes('partnership') || lowerText.includes('joint venture')) {
    return 'a partnership agreement'
  }
  
  return 'a legal document'
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}