# Educational Chatbot

## Overview

An AI-powered vocabulary and grammar learning assistant that helps users improve their language skills through interactive conversations. The chatbot analyzes user inputs to generate contextual educational content including vocabulary words, idioms, and grammar concepts, while maintaining a persistent learning notebook for review and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Application Design
- **Monolithic Python Application**: Single-file architecture with the `EducationalChatbot` class as the main component
- **Console-Based Interface**: Simple command-line interaction for accessibility and ease of use
- **Session-Based Learning**: Tracks conversation history and learning progress within each session

### AI Integration Pattern
- **OpenRouter API Client**: Uses OpenRouter as the AI service provider with configurable model selection (default: GPT-4o)
- **Contextual Analysis Engine**: Processes user inputs to generate educational content (vocabulary, idioms, grammar concepts)
- **Prompt Engineering**: Structured prompts for consistent educational content generation

### Data Management Architecture
- **File-Based Persistence**: JSON file storage for the learning notebook (`learning_notebook.json`)
- **In-Memory Session Data**: Conversation history and current session data stored in memory
- **Structured Learning Categories**: Organized storage for vocabulary, idioms, and grammar concepts

### Educational Content System
- **Dynamic Content Generation**: Real-time analysis of user inputs to create relevant learning materials
- **Progressive Learning**: Accumulative learning notebook that builds over time
- **Review and Quiz Functionality**: Built-in review system and quiz generation from learned content

### Error Handling and Resilience
- **Graceful Degradation**: Handles API failures and file system errors
- **Data Validation**: Validates notebook structure on load with fallback to new notebook creation
- **User Command Processing**: Robust command parsing for special functions (review, quiz, export, exit)

## External Dependencies

### AI Services
- **OpenRouter API**: Primary AI service for natural language processing and educational content generation
- **GPT-4o Model**: Default language model for analysis and content generation (configurable)

### Python Libraries
- **requests**: HTTP client for API communication with OpenRouter
- **json**: Data serialization for notebook persistence
- **datetime**: Session tracking and timestamping
- **os**: File system operations for notebook management
- **typing**: Type hints for better code maintainability

### File System Dependencies
- **learning_notebook.json**: Persistent storage file for user's learning progress
- **Local file system**: Required for notebook data persistence and export functionality