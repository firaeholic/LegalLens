import type { NextApiRequest, NextApiResponse } from 'next'

interface ClauseNode {
  id: string
  text: string
  type: string
  riskLevel: 'high' | 'medium' | 'low' | 'positive'
  category: string
  connections: string[]
}

interface FlowData {
  nodes: ClauseNode[]
  relationships: Array<{
    from: string
    to: string
    type: string
    description: string
  }>
  summary: {
    totalClauses: number
    riskDistribution: {
      high: number
      medium: number
      low: number
      positive: number
    }
    categories: string[]
  }
}

interface VisualizeResponse {
  flowData?: FlowData
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VisualizeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, analysisResults } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'No text provided' })
    }

    // Generate flow visualization data
    const flowData = await generateFlowData(text, analysisResults)

    res.status(200).json({ flowData })
  } catch (error) {
    console.error('Visualization error:', error)
    res.status(500).json({ error: 'Failed to generate visualization data' })
  }
}

async function generateFlowData(text: string, analysisResults?: any): Promise<FlowData> {
  // Extract clauses from text
  const clauses = extractClauses(text)
  
  // Create nodes from clauses
  const nodes: ClauseNode[] = clauses.map((clause, index) => {
    const analysis = analyzeClause(clause)
    return {
      id: `clause_${index + 1}`,
      text: clause.substring(0, 100) + (clause.length > 100 ? '...' : ''),
      type: analysis.type,
      riskLevel: analysis.riskLevel,
      category: analysis.category,
      connections: []
    }
  })
  
  // Generate relationships between clauses
  const relationships = generateRelationships(nodes, clauses)
  
  // Update node connections
  relationships.forEach(rel => {
    const fromNode = nodes.find(n => n.id === rel.from)
    const toNode = nodes.find(n => n.id === rel.to)
    if (fromNode && toNode) {
      fromNode.connections.push(rel.to)
    }
  })
  
  // Calculate summary statistics
  const summary = calculateSummary(nodes)
  
  return {
    nodes,
    relationships,
    summary
  }
}

function extractClauses(text: string): string[] {
  // Split text into potential clauses
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Group related sentences into clauses
  const clauses: string[] = []
  let currentClause = ''
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    
    // Check if this starts a new clause
    if (isClauseStart(trimmed) && currentClause.length > 0) {
      clauses.push(currentClause.trim())
      currentClause = trimmed
    } else {
      currentClause += (currentClause ? '. ' : '') + trimmed
    }
    
    // If clause is getting too long, split it
    if (currentClause.length > 300) {
      clauses.push(currentClause.trim())
      currentClause = ''
    }
  }
  
  if (currentClause.trim()) {
    clauses.push(currentClause.trim())
  }
  
  return clauses.filter(clause => clause.length > 30)
}

function isClauseStart(sentence: string): boolean {
  const lowerSentence = sentence.toLowerCase()
  
  const clauseStarters = [
    'section',
    'article',
    'clause',
    'paragraph',
    'whereas',
    'therefore',
    'furthermore',
    'in addition',
    'notwithstanding',
    'subject to',
    'provided that',
    'it is agreed',
    'the parties agree',
    'each party',
    'either party',
    'upon termination',
    'in the event',
    'if any',
    'this agreement'
  ]
  
  return clauseStarters.some(starter => lowerSentence.startsWith(starter))
}

function analyzeClause(clause: string): {
  type: string
  riskLevel: 'high' | 'medium' | 'low' | 'positive'
  category: string
} {
  const lowerClause = clause.toLowerCase()
  
  // Determine clause type and category
  let type = 'general'
  let category = 'General'
  let riskLevel: 'high' | 'medium' | 'low' | 'positive' = 'low'
  
  // Payment and financial clauses
  if (lowerClause.includes('payment') || lowerClause.includes('fee') || 
      lowerClause.includes('cost') || lowerClause.includes('compensation')) {
    type = 'financial'
    category = 'Financial Terms'
    riskLevel = 'medium'
  }
  
  // Termination clauses
  else if (lowerClause.includes('terminat') || lowerClause.includes('end') || 
           lowerClause.includes('cancel') || lowerClause.includes('expire')) {
    type = 'termination'
    category = 'Termination'
    riskLevel = 'medium'
  }
  
  // Liability and risk clauses
  else if (lowerClause.includes('liability') || lowerClause.includes('damages') || 
           lowerClause.includes('indemnif') || lowerClause.includes('waive') ||
           lowerClause.includes('disclaim') || lowerClause.includes('limit')) {
    type = 'liability'
    category = 'Liability & Risk'
    riskLevel = 'high'
  }
  
  // Intellectual property
  else if (lowerClause.includes('intellectual property') || lowerClause.includes('copyright') || 
           lowerClause.includes('trademark') || lowerClause.includes('patent') ||
           lowerClause.includes('proprietary')) {
    type = 'intellectual_property'
    category = 'Intellectual Property'
    riskLevel = 'medium'
  }
  
  // Confidentiality
  else if (lowerClause.includes('confidential') || lowerClause.includes('non-disclosure') || 
           lowerClause.includes('proprietary information') || lowerClause.includes('trade secret')) {
    type = 'confidentiality'
    category = 'Confidentiality'
    riskLevel = 'medium'
  }
  
  // Performance and obligations
  else if (lowerClause.includes('shall') || lowerClause.includes('must') || 
           lowerClause.includes('required') || lowerClause.includes('obligation')) {
    type = 'obligation'
    category = 'Obligations'
    riskLevel = 'medium'
  }
  
  // Warranties and representations
  else if (lowerClause.includes('warrant') || lowerClause.includes('represent') || 
           lowerClause.includes('guarantee') || lowerClause.includes('assure')) {
    type = 'warranty'
    category = 'Warranties'
    riskLevel = 'low'
  }
  
  // Dispute resolution
  else if (lowerClause.includes('dispute') || lowerClause.includes('arbitration') || 
           lowerClause.includes('mediation') || lowerClause.includes('litigation')) {
    type = 'dispute_resolution'
    category = 'Dispute Resolution'
    riskLevel = 'medium'
  }
  
  // Governing law
  else if (lowerClause.includes('governing law') || lowerClause.includes('jurisdiction') || 
           lowerClause.includes('venue') || lowerClause.includes('court')) {
    type = 'governing_law'
    category = 'Legal Framework'
    riskLevel = 'low'
  }
  
  // Benefits and positive terms
  else if (lowerClause.includes('benefit') || lowerClause.includes('advantage') || 
           lowerClause.includes('protection') || lowerClause.includes('right')) {
    type = 'benefit'
    category = 'Benefits & Rights'
    riskLevel = 'positive'
  }
  
  // Check for high-risk indicators
  const highRiskTerms = [
    'unlimited liability',
    'personal guarantee',
    'waive all rights',
    'no recourse',
    'as is',
    'without warranty',
    'sole discretion',
    'immediate termination',
    'liquidated damages',
    'penalty'
  ]
  
  if (highRiskTerms.some(term => lowerClause.includes(term))) {
    riskLevel = 'high'
  }
  
  return { type, riskLevel, category }
}

function generateRelationships(nodes: ClauseNode[], clauses: string[]): Array<{
  from: string
  to: string
  type: string
  description: string
}> {
  const relationships: Array<{
    from: string
    to: string
    type: string
    description: string
  }> = []
  
  // Find relationships between clauses
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i]
      const node2 = nodes[j]
      const clause1 = clauses[i]?.toLowerCase() || ''
      const clause2 = clauses[j]?.toLowerCase() || ''
      
      // Check for various types of relationships
      const relationship = findRelationship(node1, node2, clause1, clause2)
      
      if (relationship) {
        relationships.push({
          from: node1.id,
          to: node2.id,
          type: relationship.type,
          description: relationship.description
        })
      }
    }
  }
  
  return relationships
}

function findRelationship(node1: ClauseNode, node2: ClauseNode, clause1: string, clause2: string): {
  type: string
  description: string
} | null {
  // Sequential relationship (one clause follows another logically)
  if (Math.abs(parseInt(node1.id.split('_')[1]) - parseInt(node2.id.split('_')[1])) === 1) {
    return {
      type: 'sequential',
      description: 'Sequential clauses in the document'
    }
  }
  
  // Conditional relationship
  if ((clause1.includes('if') || clause1.includes('provided that') || clause1.includes('subject to')) &&
      (clause2.includes('then') || clause2.includes('shall') || clause2.includes('must'))) {
    return {
      type: 'conditional',
      description: 'Conditional dependency between clauses'
    }
  }
  
  // Reference relationship
  if (clause1.includes('section') || clause1.includes('paragraph') || clause1.includes('clause')) {
    return {
      type: 'reference',
      description: 'One clause references another'
    }
  }
  
  // Conflict relationship (opposing terms)
  if ((node1.riskLevel === 'high' && node2.riskLevel === 'positive') ||
      (node1.riskLevel === 'positive' && node2.riskLevel === 'high')) {
    return {
      type: 'conflict',
      description: 'Potentially conflicting terms'
    }
  }
  
  // Category relationship (same category)
  if (node1.category === node2.category && node1.category !== 'General') {
    return {
      type: 'category',
      description: `Both relate to ${node1.category}`
    }
  }
  
  // Dependency relationship
  if ((node1.type === 'obligation' && node2.type === 'financial') ||
      (node1.type === 'termination' && node2.type === 'liability')) {
    return {
      type: 'dependency',
      description: 'One clause depends on another'
    }
  }
  
  return null
}

function calculateSummary(nodes: ClauseNode[]): {
  totalClauses: number
  riskDistribution: {
    high: number
    medium: number
    low: number
    positive: number
  }
  categories: string[]
} {
  const riskDistribution = {
    high: 0,
    medium: 0,
    low: 0,
    positive: 0
  }
  
  const categories = new Set<string>()
  
  nodes.forEach(node => {
    riskDistribution[node.riskLevel]++
    categories.add(node.category)
  })
  
  return {
    totalClauses: nodes.length,
    riskDistribution,
    categories: Array.from(categories)
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}