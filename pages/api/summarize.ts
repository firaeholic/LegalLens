import type { NextApiRequest, NextApiResponse } from 'next'
import type { SummaryResult } from '../../types'

interface SummarizeResponse extends Partial<SummaryResult> {
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
    let lastError = null
    
    try {
      // First try: Hugging Face Inference API (free tier)
      summary = await summarizeWithHuggingFace(text)
    } catch (error) {
      console.log('Hugging Face failed:', error.message)
      lastError = error
      try {
        // Second try: OpenAI-compatible free services
        summary = await summarizeWithFreeAPI(text)
      } catch (error2) {
        console.log('Free API failed:', error2.message)
        lastError = error2
        try {
          // Fallback: Rule-based summarization
          summary = await ruleBasedSummarization(text)
        } catch (error3) {
          console.log('Rule-based summarization failed:', error3.message)
          lastError = error3
        }
      }
    }

    if (!summary.trim()) {
      return res.status(500).json({ 
        error: `Failed to generate summary. Last error: ${lastError?.message || 'Unknown error'}` 
      })
    }

    // Create complete SummaryResult object
    const result: SummaryResult = {
      summary: summary.trim(),
      keyPoints: extractKeyPoints(summary),
      wordCount: text.split(/\s+/).length,
      compressionRatio: summary.split(/\s+/).length / text.split(/\s+/).length,
      method: lastError ? 'extractive' : 'ai'
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Summarization error:', error)
    res.status(500).json({ error: 'Failed to process summarization request' })
  }
}

// Try Hugging Face Inference API (free tier)
async function summarizeWithHuggingFace(text: string): Promise<string> {
  const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
  
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured')
  }

  // Truncate text if too long (BART has token limits)
  const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text
  
  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout
  
  try {
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
      }),
      signal: controller.signal // Add abort signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result[0]?.summary_text || result.summary_text || ''
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Hugging Face API request timed out')
    }
    throw error
  }
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

// Extract key points from summary
function extractKeyPoints(summary: string): string[] {
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10)
  
  // Take up to 3 most important sentences as key points
  const keyPoints = sentences
    .slice(0, 3)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
  
  return keyPoints.length > 0 ? keyPoints : ['Summary generated successfully']
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