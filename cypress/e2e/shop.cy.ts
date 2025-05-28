describe('Shop Page Cypress Tests', () => {
  beforeEach(() => {
    cy.visit('/home/shop'); // Your route
    // Wait for initial products to load (adjust the API call alias if you want)
    cy.intercept('GET', '/api/products*').as('getProducts');
    cy.wait('@getProducts');
  });

  it('should load and display products', () => {
    cy.get('[data-cy=product-card]').should('have.length.at.least', 1);

    // Check that categories text appear (adjust selectors if needed)
    cy.contains('Accessories').should('exist');
    cy.contains('Food').should('exist');
  });

  it('should filter products by species when toggled', () => {
    // Assuming checkboxes have data-cy attributes like data-cy=filter-species-Dog
    cy.get('[data-cy=filter-species-Dog]').click();

    cy.wait('@getProducts');

    cy.get('[data-cy=product-card]').should('exist');
  });

  it('should filter products by category when toggled', () => {
    // Assuming category checkboxes have data-cy attribute e.g. data-cy=filter-category-Food
    cy.get('[data-cy=filter-category-Food]').click();

    cy.wait('@getProducts');

    cy.get('[data-cy=product-card]').should('exist');
  });

  it('should search products and update list', () => {
    cy.get('[data-cy=search-input]').type('Bone');

    cy.wait('@getProducts');

    cy.get('[data-cy=product-card]').should('contain.text', 'Bone');
  });

  it('should paginate products', () => {
    cy.get('.mat-paginator-navigation-next').click();

    cy.wait('@getProducts');

    cy.get('[data-cy=product-card]').should('exist');
  });

  it('should add a product to the cart and update cart badge', () => {
    // Add first product to cart
    cy.get('[data-cy=product-card]').first().within(() => {
      cy.get('[data-cy=add-to-cart-btn]').click();
    });

    // Wait for add to cart API call
    cy.intercept('POST', '/api/cart/add').as('addToCart');
    cy.wait('@addToCart');

    // Verify cart badge shows 1 or more
    cy.get('[data-cy=cart-badge]').should('exist').and('not.be.empty');
  });
});
