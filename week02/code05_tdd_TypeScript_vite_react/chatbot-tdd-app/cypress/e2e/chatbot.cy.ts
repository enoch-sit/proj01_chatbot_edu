describe('Chatbot E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the chatbot application', () => {
    cy.get('[role="main"]').should('be.visible');
    cy.contains(/welcome.*TDD/i).should('be.visible');
  });

  it('should handle user interaction flow', () => {
    // Type and send a message
    cy.get('input[placeholder*="Type your message"]')
      .type('hello');
    
    cy.get('button').contains('Send').click();

    // Verify user message appears
    cy.contains('hello').should('be.visible');

    // Wait for and verify bot response
    cy.contains(/Hello.*TDD.*chatbot/i, { timeout: 2000 })
      .should('be.visible');
  });

  it('should handle Enter key submission', () => {
    cy.get('input[placeholder*="Type your message"]')
      .type('vite{enter}');

    cy.contains('vite').should('be.visible');
    cy.contains(/Vite.*amazing.*TDD/i, { timeout: 2000 })
      .should('be.visible');
  });

  it('should disable send button for empty input', () => {
    cy.get('button').contains('Send')
      .should('be.disabled');

    cy.get('input[placeholder*="Type your message"]')
      .type('hello');

    cy.get('button').contains('Send')
      .should('not.be.disabled');

    cy.get('input[placeholder*="Type your message"]')
      .clear();

    cy.get('button').contains('Send')
      .should('be.disabled');
  });

  it('should maintain conversation history', () => {
    // Send multiple messages
    cy.get('input[placeholder*="Type your message"]')
      .type('hello{enter}');

    cy.contains(/Hello.*TDD.*chatbot/i, { timeout: 2000 });

    cy.get('input[placeholder*="Type your message"]')
      .type('vite{enter}');

    cy.contains(/Vite.*amazing.*TDD/i, { timeout: 2000 });

    // Check that all messages are still visible
    cy.contains('hello').should('be.visible');
    cy.contains('vite').should('be.visible');
    cy.contains(/Hello.*TDD.*chatbot/i).should('be.visible');
    cy.contains(/Vite.*amazing.*TDD/i).should('be.visible');
  });

  it('should have proper accessibility attributes', () => {
    cy.get('[role="main"]').should('exist');
    cy.get('[role="log"]').should('exist');
    cy.get('input').should('have.attr', 'placeholder');
    
    // Send a message to create list items
    cy.get('input[placeholder*="Type your message"]')
      .type('hello{enter}');

    cy.get('[role="listitem"]').should('exist');
  });
});