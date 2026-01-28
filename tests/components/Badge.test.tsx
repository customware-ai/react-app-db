import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '~/components/ui/Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('variants', () => {
    it('should apply default variant by default', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge.className).toContain('bg-surface-100');
      expect(badge.className).toContain('text-surface-700');
    });

    it('should apply primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge.className).toContain('bg-primary-100');
      expect(badge.className).toContain('text-primary-700');
    });

    it('should apply success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge.className).toContain('bg-success-light');
      expect(badge.className).toContain('text-success-dark');
    });

    it('should apply warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge.className).toContain('bg-warning-light');
      expect(badge.className).toContain('text-warning-dark');
    });

    it('should apply danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge.className).toContain('bg-danger-light');
      expect(badge.className).toContain('text-danger-dark');
    });

    it('should apply info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge.className).toContain('bg-info-light');
      expect(badge.className).toContain('text-info-dark');
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('rounded-full');
      expect(badge.className).toContain('text-xs');
      expect(badge.className).toContain('font-medium');
    });

    it('should apply padding styles', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.className).toContain('px-2.5');
      expect(badge.className).toContain('py-0.5');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge.className).toContain('custom-badge');
      expect(badge.className).toContain('inline-flex');
    });
  });

  describe('additional props', () => {
    it('should pass through additional span props', () => {
      render(<Badge data-testid="badge" id="my-badge">Test</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
    });
  });
});
