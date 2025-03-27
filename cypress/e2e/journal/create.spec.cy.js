/**
 * @Author: isaacmwauramuturi mwauraisaac9@gmail.com
 * @Date: 2025-03-27 04:23:45
 * @LastEditors: isaacmwauramuturi mwauraisaac9@gmail.com
 * @LastEditTime: 2025-03-27 04:23:56
 * @FilePath: cypress/e2e/journal/create.spec.cy.js
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
describe('Journal Creation', () => {
    beforeEach(() => {
        cy.login(); // Custom command we'll create
        cy.visit('/journal/add');
    });

    it('should create a new journal entry', () => {
        const testTitle = `Test Journal ${Date.now()}`;

        cy.get('#title').type(testTitle);
        cy.get('#content').type('This is a test journal entry content');
        cy.get('#date').type('2023-05-15');
        cy.get('#category').type('Test Category');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/dashboard');
        cy.contains(testTitle).should('exist');
    });

    it('should show validation errors', () => {
        cy.get('button[type="submit"]').click();
        cy.contains('Title is required').should('exist');
        cy.contains('Content is required').should('exist');
    });
});