import type { NextApiRequest, NextApiResponse } from 'next'

interface OCRResponse {
  text: string
  confidence: number
  processingTime: number
  method: 'ai' | 'fallback'
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OCRResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {
    // For demo purposes, simulate OCR processing without actual file parsing
    // In a real implementation, you would parse the multipart data and process the file
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate different document types based on request
    const extractedText = await simulateDocumentExtraction()
    const method: 'ai' | 'fallback' = 'ai'

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No text could be extracted from the document' })
    }

    const processingTime = Date.now() - startTime
    const confidence = Math.random() * 0.3 + 0.7 // Simulate confidence between 0.7-1.0

    res.status(200).json({ 
      text: extractedText,
      confidence,
      processingTime,
      method
    })
  } catch (error) {
    console.error('OCR processing error:', error)
    
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Simulate document text extraction for demo purposes
async function simulateDocumentExtraction(): Promise<string> {
  // This is a simulation - in a real app you would:
  // 1. Parse the uploaded file from FormData
  // 2. Use appropriate libraries (pdf-parse, tesseract.js, etc.)
  // 3. Extract text based on file type
  
  return `LEGAL SERVICES AGREEMENT

This Legal Services Agreement ("Agreement") is entered into on [DATE] between [CLIENT NAME], a [STATE] corporation ("Client") and [LAW FIRM NAME], a professional corporation ("Attorney").

1. SCOPE OF SERVICES
Attorney agrees to provide legal services to Client in connection with [MATTER DESCRIPTION]. The specific services to be provided include:
- Legal research and analysis
- Document review and preparation
- Representation in negotiations
- Court appearances as necessary

2. FEES AND PAYMENT
Client agrees to pay Attorney at the rate of $[HOURLY RATE] per hour for all time spent on this matter. Client shall pay a retainer of $[RETAINER AMOUNT] upon execution of this Agreement.

3. TERMINATION
Either party may terminate this Agreement upon written notice. Client remains responsible for all fees and costs incurred prior to termination.

4. CONFIDENTIALITY
Attorney agrees to maintain the confidentiality of all Client information in accordance with applicable rules of professional conduct.

5. LIMITATION OF LIABILITY
Attorney's liability to Client shall not exceed the total fees paid by Client under this Agreement.

6. GOVERNING LAW
This Agreement shall be governed by the laws of [STATE].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

[CLIENT SIGNATURE]                    [ATTORNEY SIGNATURE]
Client                                Attorney`
}