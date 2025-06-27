import type { NextApiRequest, NextApiResponse } from 'next'

interface OCRResponse {
  extractedText?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OCRResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { file } = req.body

    if (!file || !file.data) {
      return res.status(400).json({ error: 'No file data provided' })
    }

    let extractedText = ''

    // For PDF files, try to extract text directly first
    if (file.type === 'application/pdf') {
      try {
        // For demo purposes, we'll simulate OCR extraction
        // In a real implementation, you would use a free OCR service like:
        // - OCR.space API (free tier)
        // - Google Cloud Vision API (free tier)
        // - Tesseract.js (client-side OCR)
        
        extractedText = await simulatePDFTextExtraction(file)
      } catch (error) {
        console.error('PDF text extraction failed:', error)
        extractedText = await simulateOCRExtraction(file)
      }
    } else {
      // For image files, use OCR
      extractedText = await simulateOCRExtraction(file)
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No text could be extracted from the document' })
    }

    res.status(200).json({ extractedText })
  } catch (error) {
    console.error('OCR processing error:', error)
    res.status(500).json({ error: 'Failed to process document' })
  }
}

// Simulate PDF text extraction (in real app, use pdf-parse or similar)
async function simulatePDFTextExtraction(file: any): Promise<string> {
  // This is a simulation - in a real app you would:
  // 1. Use pdf-parse to extract text from PDF
  // 2. If that fails, convert PDF to images and use OCR
  
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

// Simulate OCR extraction (in real app, use OCR.space, Tesseract.js, or similar)
async function simulateOCRExtraction(file: any): Promise<string> {
  // This is a simulation - in a real app you would:
  // 1. Send the image to a free OCR service like OCR.space
  // 2. Use Tesseract.js for client-side OCR
  // 3. Use Google Cloud Vision API free tier
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return `CONTRACT AGREEMENT

Parties: [PARTY A] and [PARTY B]
Date: [CONTRACT DATE]

TERMS AND CONDITIONS:

1. Payment Terms
- Payment due within 30 days of invoice
- Late fees of 1.5% per month on overdue amounts
- All payments must be made in US dollars

2. Delivery Terms
- Goods to be delivered within 14 business days
- Risk of loss transfers upon delivery
- Client responsible for inspection upon receipt

3. Warranty
- 90-day warranty on all products
- Warranty void if product is modified
- Replacement parts available for 2 years

4. Limitation of Liability
- Liability limited to purchase price
- No consequential damages
- Indemnification required for third-party claims

5. Termination
- Either party may terminate with 30 days notice
- Immediate termination for material breach
- Surviving obligations include payment and confidentiality

Signatures:
[SIGNATURE A]     [SIGNATURE B]`
}

// Configure body parser for larger files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}