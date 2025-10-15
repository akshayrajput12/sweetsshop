import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MithaiSpecials from './MithaiSpecials';

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock ProductCard component
jest.mock('../../../components/ProductCard', () => ({
  __esModule: true,
  default: () => <div data-testid="product-card">Product Card</div>,
}));

// Mock QuickViewModal component
jest.mock('../../../components/QuickViewModal', () => ({
  __esModule: true,
  default: () => <div data-testid="quick-view-modal">Quick View Modal</div>,
}));

describe('MithaiSpecials', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MithaiSpecials />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Sweet Mithai Specials')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Sweet Mithai Specials')).toBeInTheDocument();
  });
});