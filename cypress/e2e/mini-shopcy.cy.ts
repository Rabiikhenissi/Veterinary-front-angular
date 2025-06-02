describe('Shop Page Backend Data', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products*').as('getProducts');
    cy.visit('/home/shop');  // or whatever route triggers the API call
  });

  it('should load products data from backend', () => {
    cy.wait('@getProducts').then(({ response }) => {
      // Assert response exists
      expect(response).to.exist;
      // Assert response status is 200
      expect(response.statusCode).to.equal(200);

      // Assert response body has products array with at least 1 item
      const products = response.body;
      expect(products).to.be.an('array');
      expect(products.length).to.be.greaterThan(0);

      // Optional: check some properties on first product
      expect(products[0]).to.have.property('name');
      expect(products[0]).to.have.property('price');
    });
  });
});
