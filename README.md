# Power Plant Engine Troubleshooting Web Application

A comprehensive web application designed to help power plant technicians and engineers troubleshoot engine failures through AI-powered assistance, interactive workflows, and gamified learning experiences.

## 🚀 Features

### Core Functionality
- **AI-Powered Chat Assistant**: Context-aware troubleshooting with local LLM integration
- **Interactive Workflows**: Step-by-step troubleshooting procedures with visual guidance
- **Document Processing**: Upload and process technical manuals, procedures, and maintenance guides
- **Gamified Learning**: Interactive quizzes, challenges, and progress tracking
- **Admin Dashboard**: Document management, system monitoring, and analytics

### Technical Highlights
- **Modern UI/UX**: Responsive design with dark/light themes and smooth animations
- **Local AI Processing**: Runs entirely on-premise with Ollama integration
- **Vector Database**: ChromaDB for intelligent document search and retrieval
- **Authentication**: Supabase integration for secure user management
- **Real-time Features**: Live system monitoring and interactive feedback

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Supabase** for authentication
- **Zustand** for state management

### Backend
- **Node.js** with Express and TypeScript
- **Ollama** for local LLM inference
- **ChromaDB** for vector storage
- **Winston** for logging
- **Multer** for file uploads
- **Rate limiting** and security middleware

### AI/ML Components
- **Llama 3.2 3B** - Primary chat model
- **Nomic Embed Text v1.5** - Text embeddings
- **LLaVA** - Vision model for image analysis

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Ollama** (for local LLM inference)
4. **ChromaDB** (for vector storage)
5. **Supabase** account (for authentication)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/power-plant-app.git
cd power-plant-app
```

### 2. Install Dependencies
```bash
npm run setup
```

### 3. Set up Ollama
Install Ollama from [https://ollama.ai](https://ollama.ai) and pull the required models:

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text:v1.5
ollama pull llava
```

### 4. Set up ChromaDB
Install ChromaDB:
```bash
pip install chromadb
```

Start ChromaDB server:
```bash
chroma run --host localhost --port 8000
```

### 5. Configure Environment Variables

#### Frontend (.env in frontend directory)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Power Plant Troubleshooting
VITE_APP_VERSION=1.0.0
```

#### Backend (.env in backend directory)
```env
PORT=5000
NODE_ENV=development

# ChromaDB Configuration
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
CHROMADB_COLLECTION_NAME=power_plant_docs

# Ollama Configuration
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
OLLAMA_MODEL_CHAT=llama3.2:3b
OLLAMA_MODEL_EMBEDDING=nomic-embed-text:v1.5
OLLAMA_MODEL_VISION=llava

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=pdf,docx,txt,png,jpg,jpeg

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 6. Set up Supabase
1. Create a new project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update the frontend environment variables

## 🏃 Running the Application

### Development Mode
Start both frontend and backend simultaneously:
```bash
npm run dev
```

Or run them separately:
```bash
# Frontend (port 3000)
npm run dev:frontend

# Backend (port 5000)
npm run dev:backend
```

### Production Build
```bash
npm run build
```

## 📱 Usage

### 1. Authentication
- Navigate to `http://localhost:3000`
- Sign in with your credentials
- New users can be created through Supabase dashboard

### 2. Dashboard
- Select an engine from the dropdown
- Choose alarm type and describe the issue
- Click on any diagnostic tool to start troubleshooting

### 3. AI Chat
- Ask questions about engine problems
- Upload images for visual analysis
- Export chat history for documentation

### 4. Troubleshooting Workflow
- Follow step-by-step procedures
- Record measurements and observations
- Export reports for record-keeping

### 5. Learning Center
- Take interactive quizzes
- Complete challenges to earn points
- Track your progress and achievements

### 6. Admin Panel (Admin users only)
- Upload technical documents
- Monitor system performance
- Manage LLM models
- View analytics and usage statistics

## 🔍 API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Chat
- `POST /api/chat` - Send chat message to AI
- `GET /api/chat/history` - Get chat history

### Troubleshooting
- `POST /api/troubleshooting` - Get troubleshooting steps
- `GET /api/troubleshooting/:id` - Get specific procedure

### Documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents` - List documents
- `DELETE /api/documents/:id` - Delete document

### Admin
- `GET /api/admin/documents` - Admin document management
- `GET /api/admin/system` - System metrics
- `GET /api/admin/users` - User management

## 🔐 Security Features

- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions
- **Error Handling**: Secure error responses
- **CORS Configuration**: Proper cross-origin settings
- **Helmet.js**: Security headers

## 📊 Monitoring

### Logs
- Application logs: `backend/logs/app.log`
- Error logs: `backend/logs/error.log`
- Exception logs: `backend/logs/exceptions.log`

### Health Checks
- System health: `http://localhost:5000/api/health`
- Detailed status: `http://localhost:5000/api/health/detailed`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs for error details

## 🚀 Deployment

### Prerequisites for Production
1. Set up production Supabase project
2. Configure production ChromaDB instance
3. Set up Ollama on production server
4. Configure environment variables for production

### Docker Deployment (Coming Soon)
Docker configuration files will be provided for easy deployment.

## 🔮 Future Enhancements

- Mobile app companion
- Advanced analytics dashboard
- Integration with external maintenance systems
- Multi-language support
- Advanced AI model fine-tuning
- Predictive maintenance features

---

**Note**: This application is designed for on-premise deployment to ensure data privacy and security in industrial environments.