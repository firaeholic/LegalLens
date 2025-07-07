# LegalLens AI 🔍⚖️

A fully serverless, front-end-driven web application for legal document analysis, built with Next.js.

## 🚀 Features

- **Smart Document Upload**: Drag-and-drop PDF and image upload with validation
- **OCR Text Extraction**: Extract text from PDFs and images using AI-powered OCR
- **AI Summarization**: Convert complex legal language into plain English summaries
- **Risk Detection**: Automatically identify and highlight risky clauses
- **Interactive Chat**: Ask questions about your documents with AI-powered Q&A
- **Visual Flow Analysis**: Visualize clause relationships and contract structure
- **Export Results**: Download analysis results as JSON
- **No Backend Required**: Fully client-side with serverless API routes
- **Free to Use**: Works with free AI APIs and fallback methods

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **PDF Handling**: react-pdf, pdf.js
- **File Upload**: react-dropzone
- **Charts**: Chart.js, react-chartjs-2
- **Icons**: Lucide React
- **AI Services**: Hugging Face Inference API (optional)
- **Deployment**: Vercel (serverless)

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd LegalLens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your API keys for enhanced features:
   ```env
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   OCR_SPACE_API_KEY=your_ocr_space_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 🌐 Deployment on Vercel

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/legallens)

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set environment variables** in Vercel dashboard (optional):
   - Go to your project settings
   - Add environment variables:
     - `HUGGINGFACE_API_KEY`
     - `OCR_SPACE_API_KEY`

## 🔧 API Routes

The application includes several serverless API routes:

- `POST /api/ocr` - Extract text from uploaded documents
- `POST /api/summarize` - Summarize extracted text
- `POST /api/analyze` - Analyze text for risky clauses
- `POST /api/chat` - Chat with document using AI Q&A
- `POST /api/visualize` - Generate visualization data for clause flow

## 📱 Usage

1. **Upload Documents**: 
   - Navigate to the upload page
   - Drag and drop PDF files or images
   - Supported formats: PDF, PNG, JPG, JPEG, WEBP
   - Maximum file size: 10MB

2. **Analyze Documents**:
   - View extracted text from OCR
   - Read AI-generated summaries
   - Review identified risk levels
   - Explore clause categorization

3. **Chat with Documents**:
   - Ask questions about specific clauses
   - Get explanations in plain language
   - Use suggested questions for guidance

4. **Visualize Contract Flow**:
   - View clause relationships
   - Analyze risk distribution
   - Export analysis results

## 🔒 Privacy & Security

- **No Data Storage**: All processing happens in memory
- **Client-Side Storage**: Results stored temporarily in browser session
- **No User Accounts**: No registration or login required
- **Secure Processing**: Files processed securely through serverless functions
- **API Key Security**: Environment variables kept secure in Vercel

## 🆓 Free Usage

The application is designed to work completely free:

- **Fallback OCR**: Rule-based text extraction when AI APIs are unavailable
- **Extractive Summarization**: Keyword-based summarization as fallback
- **Pattern-Based Analysis**: Rule-based clause detection
- **Smart Q&A**: Context-aware question answering without external APIs

## 🔑 Optional API Keys

For enhanced features, you can add these free API keys:

### Hugging Face (Free Tier)
1. Sign up at [Hugging Face](https://huggingface.co/)
2. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token
4. Add to `.env.local` as `HUGGINGFACE_API_KEY`

### OCR.space (Free Tier)
1. Sign up at [OCR.space](https://ocr.space/ocrapi)
2. Get your free API key
3. Add to `.env.local` as `OCR_SPACE_API_KEY`

## 🛠️ Development

### Project Structure
```
LegalLens/
├── components/          # React components
│   ├── ChatWithDoc.tsx
│   ├── ClauseSummary.tsx
│   ├── FlowVisualizer.tsx
│   └── PDFViewer.tsx
├── pages/              # Next.js pages
│   ├── api/           # Serverless API routes
│   │   ├── analyze.ts
│   │   ├── chat.ts
│   │   ├── ocr.ts
│   │   ├── summarize.ts
│   │   └── visualize.ts
│   ├── _app.tsx
│   ├── analyze.tsx
│   ├── index.tsx
│   └── upload.tsx
├── styles/            # CSS styles
│   └── globals.css
├── public/            # Static assets
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for informational purposes only and should not be considered as legal advice. Always consult with qualified legal professionals for important legal matters.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/legallens/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🎯 Roadmap

- [ ] Support for more document formats (DOCX, TXT)
- [ ] Advanced clause templates
- [ ] Multi-language support
- [ ] Enhanced visualization options
- [ ] Batch document processing
- [ ] Integration with more AI providers

---

**Built with ❤️ for the legal community**
