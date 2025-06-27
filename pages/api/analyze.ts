import type { NextApiRequest, NextApiResponse } from 'next'

interface Clause {
  text: string
  type: 'risk' | 'neutral' | 'positive'
  riskLevel: 'high' | 'medium' | 'low'
  explanation: string
}

interface AnalyzeResponse {
  clauses?: Clause[]
  riskScore?: number
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'No text provided for analysis' })
    }

    if (text.length < 50) {
      return res.status(400).json({ error: 'Text too short for meaningful analysis' })
    }

    // Analyze the document for clauses and risks
    const clauses = await analyzeDocumentClauses(text)
    const riskScore = calculateOverallRiskScore(clauses)

    res.status(200).json({ clauses, riskScore })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze document' })
  }
}

// Main analysis function
async function analyzeDocumentClauses(text: string): Promise<Clause[]> {
  const clauses: Clause[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Define risk patterns and keywords
  const riskPatterns = {
    high: {
      patterns: [
        /liability.*unlimited/i,
        /indemnif.*all.*claims/i,
        /waive.*all.*rights/i,
        /exclusive.*remedy/i,
        /no.*warranty/i,
        /as.*is.*basis/i,
        /liquidated.*damages/i,
        /penalty/i,
        /forfeit/i,
        /immediate.*termination/i,
        /sole.*discretion/i,
        /irrevocable/i,
        /personal.*guarantee/i
      ],
      keywords: ['penalty', 'forfeit', 'unlimited liability', 'waive rights', 'no warranty']
    },
    medium: {
      patterns: [
        /limitation.*liability/i,
        /consequential.*damages/i,
        /material.*breach/i,
        /cure.*period/i,
        /arbitration.*binding/i,
        /governing.*law/i,
        /assignment.*consent/i,
        /modification.*writing/i,
        /confidentiality/i,
        /non.*compete/i,
        /intellectual.*property/i
      ],
      keywords: ['limitation of liability', 'binding arbitration', 'non-compete', 'confidentiality']
    },
    low: {
      patterns: [
        /reasonable.*efforts/i,
        /good.*faith/i,
        /mutual.*agreement/i,
        /written.*notice/i,
        /business.*days/i,
        /standard.*terms/i
      ],
      keywords: ['reasonable efforts', 'good faith', 'mutual agreement', 'standard terms']
    }
  }

  // Positive patterns
  const positivePatterns = {
    patterns: [
      /warranty.*provided/i,
      /guarantee.*quality/i,
      /right.*to.*cure/i,
      /notice.*period/i,
      /mutual.*termination/i,
      /fair.*market.*value/i,
      /reasonable.*compensation/i,
      /protection.*of.*rights/i
    ],
    keywords: ['warranty provided', 'right to cure', 'fair market value', 'protection of rights']
  }

  // Analyze each sentence
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (trimmedSentence.length < 30) continue

    let clauseFound = false

    // Check for high-risk patterns
    for (const pattern of riskPatterns.high.patterns) {
      if (pattern.test(trimmedSentence)) {
        clauses.push({
          text: trimmedSentence,
          type: 'risk',
          riskLevel: 'high',
          explanation: generateRiskExplanation(trimmedSentence, 'high')
        })
        clauseFound = true
        break
      }
    }

    if (clauseFound) continue

    // Check for medium-risk patterns
    for (const pattern of riskPatterns.medium.patterns) {
      if (pattern.test(trimmedSentence)) {
        clauses.push({
          text: trimmedSentence,
          type: 'risk',
          riskLevel: 'medium',
          explanation: generateRiskExplanation(trimmedSentence, 'medium')
        })
        clauseFound = true
        break
      }
    }

    if (clauseFound) continue

    // Check for positive patterns
    for (const pattern of positivePatterns.patterns) {
      if (pattern.test(trimmedSentence)) {
        clauses.push({
          text: trimmedSentence,
          type: 'positive',
          riskLevel: 'low',
          explanation: generatePositiveExplanation(trimmedSentence)
        })
        clauseFound = true
        break
      }
    }

    if (clauseFound) continue

    // Check for low-risk patterns
    for (const pattern of riskPatterns.low.patterns) {
      if (pattern.test(trimmedSentence)) {
        clauses.push({
          text: trimmedSentence,
          type: 'neutral',
          riskLevel: 'low',
          explanation: generateNeutralExplanation(trimmedSentence)
        })
        clauseFound = true
        break
      }
    }

    // Check for important legal terms that should be highlighted
    if (!clauseFound && containsImportantLegalTerms(trimmedSentence)) {
      clauses.push({
        text: trimmedSentence,
        type: 'neutral',
        riskLevel: 'medium',
        explanation: 'This clause contains important legal terms that should be reviewed carefully.'
      })
    }
  }

  // If no specific clauses found, create some general analysis
  if (clauses.length === 0) {
    const generalAnalysis = performGeneralAnalysis(text)
    clauses.push(...generalAnalysis)
  }

  return clauses
}

// Generate risk explanations
function generateRiskExplanation(sentence: string, riskLevel: string): string {
  const lowerSentence = sentence.toLowerCase()
  
  if (lowerSentence.includes('unlimited') && lowerSentence.includes('liability')) {
    return 'This clause exposes you to unlimited financial liability, which could result in significant financial loss beyond the contract value.'
  }
  
  if (lowerSentence.includes('indemnif')) {
    return 'This indemnification clause requires you to protect the other party from legal claims, potentially at significant cost.'
  }
  
  if (lowerSentence.includes('waive') && lowerSentence.includes('rights')) {
    return 'This clause requires you to give up important legal rights, which could limit your options if disputes arise.'
  }
  
  if (lowerSentence.includes('no warranty') || lowerSentence.includes('as is')) {
    return 'This disclaimer removes warranties and protections, meaning you accept the product/service without guarantees.'
  }
  
  if (lowerSentence.includes('penalty') || lowerSentence.includes('liquidated damages')) {
    return 'This clause imposes financial penalties that could be costly if you fail to meet certain obligations.'
  }
  
  if (lowerSentence.includes('immediate termination')) {
    return 'This allows for immediate contract termination, which could disrupt your business operations without notice.'
  }
  
  if (lowerSentence.includes('sole discretion')) {
    return 'This gives the other party unilateral decision-making power, potentially limiting your input on important matters.'
  }
  
  if (riskLevel === 'high') {
    return 'This clause contains terms that could expose you to significant risk or liability. Consider negotiating modifications.'
  }
  
  if (riskLevel === 'medium') {
    return 'This clause has moderate risk implications and should be reviewed carefully to understand your obligations.'
  }
  
  return 'This clause should be reviewed to understand its implications for your rights and obligations.'
}

// Generate positive explanations
function generatePositiveExplanation(sentence: string): string {
  const lowerSentence = sentence.toLowerCase()
  
  if (lowerSentence.includes('warranty') || lowerSentence.includes('guarantee')) {
    return 'This clause provides you with warranties or guarantees, offering protection and recourse if issues arise.'
  }
  
  if (lowerSentence.includes('right to cure')) {
    return 'This gives you the opportunity to fix any breaches before facing penalties, providing valuable protection.'
  }
  
  if (lowerSentence.includes('notice period')) {
    return 'This ensures you receive adequate notice before any adverse actions, giving you time to respond.'
  }
  
  if (lowerSentence.includes('fair market value')) {
    return 'This ensures pricing or valuations are based on fair market standards, protecting against unfair terms.'
  }
  
  return 'This clause appears to provide beneficial terms or protections in your favor.'
}

// Generate neutral explanations
function generateNeutralExplanation(sentence: string): string {
  const lowerSentence = sentence.toLowerCase()
  
  if (lowerSentence.includes('reasonable efforts')) {
    return 'This sets a reasonable standard for performance obligations without being overly burdensome.'
  }
  
  if (lowerSentence.includes('good faith')) {
    return 'This requires both parties to act honestly and fairly in their dealings under the contract.'
  }
  
  if (lowerSentence.includes('written notice')) {
    return 'This establishes clear communication requirements, ensuring important notices are properly documented.'
  }
  
  return 'This appears to be a standard contractual provision with balanced terms for both parties.'
}

// Check for important legal terms
function containsImportantLegalTerms(sentence: string): boolean {
  const importantTerms = [
    'force majeure', 'assignment', 'severability', 'entire agreement',
    'governing law', 'jurisdiction', 'dispute resolution', 'arbitration',
    'intellectual property', 'trade secrets', 'confidential information',
    'payment terms', 'delivery terms', 'performance standards'
  ]
  
  const lowerSentence = sentence.toLowerCase()
  return importantTerms.some(term => lowerSentence.includes(term))
}

// Perform general analysis when no specific clauses found
function performGeneralAnalysis(text: string): Clause[] {
  const clauses: Clause[] = []
  const lowerText = text.toLowerCase()
  
  // Check for document type and add relevant analysis
  if (lowerText.includes('employment') || lowerText.includes('employee')) {
    clauses.push({
      text: 'Employment agreement detected',
      type: 'neutral',
      riskLevel: 'medium',
      explanation: 'Employment agreements typically contain important terms regarding compensation, benefits, termination, and post-employment obligations. Review carefully for non-compete clauses and termination conditions.'
    })
  }
  
  if (lowerText.includes('payment') && lowerText.includes('terms')) {
    clauses.push({
      text: 'Payment terms identified',
      type: 'neutral',
      riskLevel: 'medium',
      explanation: 'Payment terms define when and how payments must be made. Ensure you understand due dates, late fees, and acceptable payment methods.'
    })
  }
  
  if (lowerText.includes('termination')) {
    clauses.push({
      text: 'Termination provisions found',
      type: 'risk',
      riskLevel: 'medium',
      explanation: 'Termination clauses define how and when the contract can be ended. Pay attention to notice requirements, termination fees, and post-termination obligations.'
    })
  }
  
  return clauses
}

// Calculate overall risk score
function calculateOverallRiskScore(clauses: Clause[]): number {
  if (clauses.length === 0) return 30 // Default moderate risk for unknown documents
  
  let totalScore = 0
  let weightedCount = 0
  
  for (const clause of clauses) {
    let score = 0
    let weight = 1
    
    // Base score by risk level
    switch (clause.riskLevel) {
      case 'high':
        score = 80
        weight = 3
        break
      case 'medium':
        score = 50
        weight = 2
        break
      case 'low':
        score = 20
        weight = 1
        break
    }
    
    // Adjust by clause type
    switch (clause.type) {
      case 'risk':
        score += 10
        break
      case 'positive':
        score -= 15
        break
      case 'neutral':
        // No adjustment
        break
    }
    
    totalScore += score * weight
    weightedCount += weight
  }
  
  const averageScore = weightedCount > 0 ? totalScore / weightedCount : 30
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(averageScore)))
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}