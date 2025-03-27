/**
 * @Author: isaacmwauramuturi mwauraisaac9@gmail.com
 * @Date: 2025-03-27 04:22:21
 * @LastEditors: isaacmwauramuturi mwauraisaac9@gmail.com
 * @LastEditTime: 2025-03-27 04:22:42
 * @FilePath: cypress/e2e/auth/login.spec.cy.js
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('should login with valid credentials', () => {
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('password123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
        cy.contains('Welcome back').should('exist');
    });

    it('should show error with invalid credentials', () => {
        cy.get('#email').type('wrong@example.com');
        cy.get('#password').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains('Invalid credentials').should('exist');
    });
});