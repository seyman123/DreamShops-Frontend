import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

// Custom render function that wraps components with necessary providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialAuth = null,
    initialCart = { cartItems: [], cartTotal: 0 },
    ...renderOptions
  } = options;

  const AllProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider initialUser={initialAuth}>
          <CartProvider initialState={initialCart}>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

// Mock API responses
export const mockApiResponses = {
  products: {
    success: {
      data: {
        data: [
          {
            id: 1,
            name: 'Test Product',
            price: 1000,
            effectivePrice: 800,
            currentlyOnSale: true,
            discountPercentage: 20,
            inventory: 10,
            brand: 'Test Brand',
            category: { id: 1, name: 'Test Category' },
            images: [{ downloadUrl: '/test-image.jpg' }]
          }
        ]
      }
    }
  },
  cart: {
    success: {
      data: {
        data: {
          cartId: 1,
          cartItems: [
            {
              itemId: 1,
              quantity: 2,
              unitPrice: 1000,
              product: {
                id: 1,
                name: 'Test Product',
                price: 1000,
                brand: 'Test Brand'
              }
            }
          ]
        }
      }
    }
  },
  user: {
    success: {
      data: {
        data: {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        }
      }
    }
  }
};

// Mock user for testing
export const mockUser = {
  id: 1,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  roles: [{ name: 'USER' }]
};

// Test data generators
export const generateMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  price: 1000,
  effectivePrice: null,
  currentlyOnSale: false,
  discountPercentage: 0,
  inventory: 10,
  brand: 'Test Brand',
  category: { id: 1, name: 'Test Category' },
  images: [{ downloadUrl: '/test-image.jpg' }],
  ...overrides
});

export const generateMockCartItem = (overrides = {}) => ({
  itemId: 1,
  quantity: 1,
  unitPrice: 1000,
  product: generateMockProduct(),
  ...overrides
});

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event'; 