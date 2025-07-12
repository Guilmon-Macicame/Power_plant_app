#!/bin/bash

# Power Plant Troubleshooting Application Installation Script
echo "🚀 Power Plant Troubleshooting Application Installation"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_step "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_status "Node.js version is compatible"
        else
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_step "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_status "Root dependencies installed successfully"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install
    
    if [ $? -eq 0 ]; then
        print_status "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd ../backend && npm install
    
    if [ $? -eq 0 ]; then
        print_status "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Create environment files
create_env_files() {
    print_step "Creating environment files..."
    
    # Frontend environment file
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cp frontend/.env.example frontend/.env
        print_warning "Please update frontend/.env with your Supabase credentials"
    else
        print_status "Frontend .env file already exists"
    fi
    
    # Backend environment file
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cp backend/.env.example backend/.env
        print_warning "Please update backend/.env with your configuration"
    else
        print_status "Backend .env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    # Create uploads directory
    if [ ! -d "backend/uploads" ]; then
        mkdir -p backend/uploads
        print_status "Created uploads directory"
    fi
    
    # Create logs directory
    if [ ! -d "backend/logs" ]; then
        mkdir -p backend/logs
        print_status "Created logs directory"
    fi
}

# Check for Ollama
check_ollama() {
    print_step "Checking Ollama installation..."
    
    if command -v ollama &> /dev/null; then
        print_status "Ollama found"
        
        # Check if Ollama is running
        if curl -s http://localhost:11434/api/tags &> /dev/null; then
            print_status "Ollama is running"
            
            # Check for required models
            print_status "Checking for required models..."
            
            MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
            
            if echo "$MODELS" | grep -q "llama3.2:3b"; then
                print_status "✓ llama3.2:3b model found"
            else
                print_warning "llama3.2:3b model not found. Run: ollama pull llama3.2:3b"
            fi
            
            if echo "$MODELS" | grep -q "nomic-embed-text"; then
                print_status "✓ nomic-embed-text model found"
            else
                print_warning "nomic-embed-text model not found. Run: ollama pull nomic-embed-text:v1.5"
            fi
            
            if echo "$MODELS" | grep -q "llava"; then
                print_status "✓ llava model found"
            else
                print_warning "llava model not found. Run: ollama pull llava"
            fi
        else
            print_warning "Ollama is installed but not running. Please start Ollama service."
        fi
    else
        print_warning "Ollama not found. Please install from https://ollama.ai/"
        print_warning "After installation, run the following commands:"
        echo "  ollama pull llama3.2:3b"
        echo "  ollama pull nomic-embed-text:v1.5"
        echo "  ollama pull llava"
    fi
}

# Check for ChromaDB
check_chromadb() {
    print_step "Checking ChromaDB installation..."
    
    if command -v chroma &> /dev/null; then
        print_status "ChromaDB CLI found"
    elif python3 -c "import chromadb" &> /dev/null; then
        print_status "ChromaDB Python package found"
    else
        print_warning "ChromaDB not found. Please install with: pip install chromadb"
        print_warning "Then start ChromaDB server with: chroma run --host localhost --port 8000"
    fi
}

# Print final instructions
print_final_instructions() {
    print_step "Installation Complete!"
    echo ""
    echo "🎉 Power Plant Troubleshooting Application has been set up!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment files with your configuration:"
    echo "   - frontend/.env (Supabase credentials)"
    echo "   - backend/.env (System configuration)"
    echo ""
    echo "2. Make sure the following services are running:"
    echo "   - Ollama (http://localhost:11434)"
    echo "   - ChromaDB (http://localhost:8000)"
    echo ""
    echo "3. Start the application:"
    echo "   npm run dev"
    echo ""
    echo "4. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:5000"
    echo "   - Health Check: http://localhost:5000/api/health"
    echo ""
    print_status "For detailed instructions, see README.md"
}

# Main installation process
main() {
    echo "Starting installation process..."
    
    check_node
    check_npm
    install_dependencies
    create_env_files
    create_directories
    check_ollama
    check_chromadb
    print_final_instructions
    
    echo ""
    print_status "Installation script completed!"
}

# Run main function
main

exit 0