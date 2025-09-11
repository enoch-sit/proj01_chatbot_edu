// Educational Chatbot Frontend JavaScript

class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.loadingOverlay = document.getElementById('loading');
        this.contentModal = document.getElementById('content-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeModal = document.getElementById('close-modal');
        this.totalItems = document.getElementById('total-items');
        this.charCount = document.getElementById('char-count');
        
        // Notebook and quiz elements
        this.notebookContent = document.getElementById('notebook-content');
        this.quizContent = document.getElementById('quiz-content');
        this.exportBtn = document.getElementById('export-btn');
        this.startQuizBtn = document.getElementById('start-quiz-btn');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.chatInput.addEventListener('input', () => this.updateCharCount());
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.exportBtn.addEventListener('click', () => this.exportNotebook());
        this.startQuizBtn.addEventListener('click', () => this.startQuiz());
        
        // Tab navigation
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Modal close on outside click
        this.contentModal.addEventListener('click', (e) => {
            if (e.target === this.contentModal) {
                this.hideModal();
            }
        });
        
        // Initialize notebook and stats
        this.loadNotebook();
        this.updateCharCount();
    }
    
    updateCharCount() {
        const length = this.chatInput.value.length;
        this.charCount.textContent = length;
        
        if (length > 450) {
            this.charCount.style.color = 'var(--danger-color)';
        } else if (length > 350) {
            this.charCount.style.color = 'var(--warning-color)';
        } else {
            this.charCount.style.color = 'var(--text-secondary)';
        }
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.sendButton.disabled = true;
        this.chatInput.disabled = true;
        this.showLoading();
        
        // Add user message to chat
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.updateCharCount();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Add bot response to chat
            this.addMessage('bot', data.bot_response);
            
            // Show educational content if any
            if (this.hasEducationalContent(data.educational_content)) {
                this.showEducationalContent(data.educational_content);
                
                // Update notebook if items were added
                if (data.items_added > 0) {
                    this.loadNotebook();
                }
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
        } finally {
            this.hideLoading();
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }
    
    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    hasEducationalContent(content) {
        return content.vocabulary.length > 0 || content.idioms.length > 0 || content.grammar.length > 0;
    }
    
    showEducationalContent(content) {
        let html = '';
        
        // Vocabulary section
        if (content.vocabulary.length > 0) {
            html += '<div class="content-section">';
            html += '<div class="section-title"><i class="fas fa-book"></i> Vocabulary Words</div>';
            content.vocabulary.forEach((item, index) => {
                html += `
                    <div class="content-item">
                        <div class="item-title">${index + 1}. ${item.word.toUpperCase()}</div>
                        <div class="item-definition">Definition: ${item.definition}</div>
                        <div class="item-example">Example: ${item.example_sentence}</div>
                        <div class="item-synonyms"><strong>Synonyms:</strong> ${item.synonyms.join(', ')}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Idioms section
        if (content.idioms.length > 0) {
            html += '<div class="content-section">';
            html += '<div class="section-title"><i class="fas fa-comments"></i> Idioms</div>';
            content.idioms.forEach((item, index) => {
                html += `
                    <div class="content-item">
                        <div class="item-title">${index + 1}. "${item.idiom}"</div>
                        <div class="item-meaning">Meaning: ${item.meaning}</div>
                        <div class="item-example">Example: ${item.example}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Grammar section
        if (content.grammar.length > 0) {
            html += '<div class="content-section">';
            html += '<div class="section-title"><i class="fas fa-spell-check"></i> Grammar Concepts</div>';
            content.grammar.forEach((item, index) => {
                html += `
                    <div class="content-item">
                        <div class="item-title">${index + 1}. ${item.concept}</div>
                        <div class="item-explanation">Explanation: ${item.explanation}</div>
                        <div class="item-example">Correct: ${item.example_correct}</div>
                        ${item.example_incorrect ? `<div class="item-example">Incorrect: ${item.example_incorrect}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        this.modalBody.innerHTML = html;
        this.showModal();
    }
    
    showModal() {
        this.contentModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        this.contentModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    showLoading() {
        this.loadingOverlay.classList.add('show');
    }
    
    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Load data for the active tab
        if (tabName === 'notebook') {
            this.loadNotebook();
        } else if (tabName === 'quiz') {
            this.loadQuizInfo();
        }
    }
    
    async loadNotebook() {
        try {
            const response = await fetch('/api/notebook');
            const data = await response.json();
            
            this.totalItems.textContent = data.total_items;
            this.renderNotebook(data.notebook);
            
        } catch (error) {
            console.error('Error loading notebook:', error);
            this.notebookContent.innerHTML = '<div class="empty-notebook"><i class="fas fa-exclamation-triangle"></i><p>Error loading notebook</p></div>';
        }
    }
    
    renderNotebook(notebook) {
        if (notebook.vocabulary.length === 0 && notebook.idioms.length === 0 && notebook.grammar.length === 0) {
            this.notebookContent.innerHTML = '<div class="empty-notebook"><i class="fas fa-book-open"></i><p>Your notebook is empty. Start chatting to learn!</p></div>';
            return;
        }
        
        let html = '';
        
        // Vocabulary
        if (notebook.vocabulary.length > 0) {
            html += '<div class="category-section">';
            html += '<div class="category-header"><i class="fas fa-book"></i> Vocabulary Words</div>';
            notebook.vocabulary.forEach(item => {
                html += `
                    <div class="item">
                        <div class="item-title">${item.word.toUpperCase()}</div>
                        <div class="item-definition">${item.definition}</div>
                        <div class="item-example">${item.example_sentence}</div>
                        <div class="item-synonyms"><strong>Synonyms:</strong> ${item.synonyms.join(', ')}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Idioms
        if (notebook.idioms.length > 0) {
            html += '<div class="category-section">';
            html += '<div class="category-header"><i class="fas fa-comments"></i> Idioms</div>';
            notebook.idioms.forEach(item => {
                html += `
                    <div class="item">
                        <div class="item-title">"${item.idiom}"</div>
                        <div class="item-meaning">${item.meaning}</div>
                        <div class="item-example">${item.example}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Grammar
        if (notebook.grammar.length > 0) {
            html += '<div class="category-section">';
            html += '<div class="category-header"><i class="fas fa-spell-check"></i> Grammar Concepts</div>';
            notebook.grammar.forEach(item => {
                html += `
                    <div class="item">
                        <div class="item-title">${item.concept}</div>
                        <div class="item-explanation">${item.explanation}</div>
                        <div class="item-example">✓ ${item.example_correct}</div>
                        ${item.example_incorrect ? `<div class="item-example">✗ ${item.example_incorrect}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        this.notebookContent.innerHTML = html;
    }
    
    async exportNotebook() {
        try {
            this.exportBtn.disabled = true;
            this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            
            const response = await fetch('/api/export');
            const data = await response.json();
            
            // Create and trigger download
            const blob = new Blob([data.content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error exporting notebook:', error);
            alert('Error exporting notebook. Please try again.');
        } finally {
            this.exportBtn.disabled = false;
            this.exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
        }
    }
    
    async startQuiz() {
        try {
            this.startQuizBtn.disabled = true;
            this.startQuizBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            const response = await fetch('/api/quiz');
            const data = await response.json();
            
            if (data.questions.length === 0) {
                this.quizContent.innerHTML = '<div class="quiz-info"><i class="fas fa-book-open"></i><p>No items in your notebook yet. Keep learning!</p></div>';
                return;
            }
            
            this.currentQuiz = data.questions;
            this.currentQuestionIndex = 0;
            this.renderQuizQuestion();
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.quizContent.innerHTML = '<div class="quiz-info"><i class="fas fa-exclamation-triangle"></i><p>Error loading quiz. Please try again.</p></div>';
        } finally {
            this.startQuizBtn.disabled = false;
            this.startQuizBtn.innerHTML = '<i class="fas fa-play"></i> Start Quiz';
        }
    }
    
    renderQuizQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.length) {
            this.showQuizResults();
            return;
        }
        
        const question = this.currentQuiz[this.currentQuestionIndex];
        const html = `
            <div class="quiz-question">
                <h4>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.length}</h4>
                <p>${question.question}</p>
                <input type="text" class="quiz-input" id="quiz-answer" placeholder="Type your answer here...">
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn-primary" onclick="chatBot.submitAnswer()">
                        <i class="fas fa-check"></i> Submit
                    </button>
                    <button class="btn-secondary" onclick="chatBot.skipQuestion()">
                        <i class="fas fa-forward"></i> Skip
                    </button>
                    <button class="btn-secondary" onclick="chatBot.endQuiz()">
                        <i class="fas fa-stop"></i> End Quiz
                    </button>
                </div>
            </div>
        `;
        
        this.quizContent.innerHTML = html;
        document.getElementById('quiz-answer').focus();
        
        // Allow enter key to submit
        document.getElementById('quiz-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
    }
    
    submitAnswer() {
        const answer = document.getElementById('quiz-answer').value.trim();
        const question = this.currentQuiz[this.currentQuestionIndex];
        
        // Store the answer
        question.userAnswer = answer;
        question.skipped = false;
        
        // Show correct answer
        const answerDiv = document.createElement('div');
        answerDiv.className = 'quiz-answer';
        answerDiv.innerHTML = `
            <strong>Correct Answer:</strong><br>
            ${question.answer}
            ${answer ? `<br><br><strong>Your Answer:</strong><br>${answer}` : ''}
        `;
        
        document.querySelector('.quiz-question').appendChild(answerDiv);
        
        // Update button
        const submitBtn = document.querySelector('.quiz-question button');
        submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next Question';
        submitBtn.onclick = () => this.nextQuestion();
        
        // Disable input
        document.getElementById('quiz-answer').disabled = true;
    }
    
    skipQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        question.skipped = true;
        this.submitAnswer();
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        this.renderQuizQuestion();
    }
    
    endQuiz() {
        this.showQuizResults();
    }
    
    showQuizResults() {
        if (!this.currentQuiz) return;
        
        const answered = this.currentQuiz.filter(q => q.userAnswer && !q.skipped).length;
        const skipped = this.currentQuiz.filter(q => q.skipped).length;
        const total = this.currentQuiz.length;
        
        const html = `
            <div class="quiz-score">
                <h3><i class="fas fa-trophy"></i> Quiz Complete!</h3>
                <p>Questions answered: ${answered}</p>
                <p>Questions skipped: ${skipped}</p>
                <p>Total questions: ${total}</p>
            </div>
            <button class="btn-primary" onclick="chatBot.startQuiz()">
                <i class="fas fa-redo"></i> Take Another Quiz
            </button>
        `;
        
        this.quizContent.innerHTML = html;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
    }
    
    loadQuizInfo() {
        if (!this.currentQuiz) {
            this.quizContent.innerHTML = `
                <div class="quiz-info">
                    <i class="fas fa-lightbulb"></i>
                    <p>Test your knowledge with questions from your learned content!</p>
                    <p>The quiz will include vocabulary definitions, idiom meanings, and grammar concepts you've learned.</p>
                </div>
            `;
        }
    }
}

// Initialize the chatbot when the page loads
let chatBot;
document.addEventListener('DOMContentLoaded', () => {
    chatBot = new ChatBot();
});