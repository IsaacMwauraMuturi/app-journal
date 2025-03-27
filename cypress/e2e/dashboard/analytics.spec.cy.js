/**
 * @Author: isaacmwauramuturi mwauraisaac9@gmail.com
 * @Date: 2025-03-27 04:24:13
 * @LastEditors: isaacmwauramuturi mwauraisaac9@gmail.com
 * @LastEditTime: 2025-03-27 04:24:22
 * @FilePath: cypress/e2e/dashboard/analytics.spec.cy.js
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
describe('Dashboard Analytics', () => {
    before(() => {
        cy.login();
        cy.seedDatabase(); // Custom command to add test data
        cy.visit('/dashboard');
    });

    it('should display all analytics widgets', () => {
        cy.get('[data-testid="category-chart"]').should('exist');
        cy.get('[data-testid="mood-chart"]').should('exist');
        cy.get('[data-testid="word-cloud"]').should('exist');
        cy.get('[data-testid="heatmap"]').should('exist');
    });

    it('should filter data by date range', () => {
        cy.get('[data-testid="date-filter"]').select('Last 7 Days');
        cy.contains('Showing entries from last 7 days').should('exist');
        cy.get('[data-testid="journal-count"]').should('contain', '3 entries');
    });
});