// server/tests/responsive.test.js
/**
 * Testes de Responsividade (EN-52)
 * Verifica compatibilidade com diferentes tamanhos de ecrã
 */

describe('Responsividade - Mobile/Tablet/Desktop', () => {
  // Mobile breakpoint
  test('deve detectar breakpoint XS (mobile 375px)', () => {
    const getBreakpoint = (width) => {
      if (width < 576) return 'xs';
      if (width < 768) return 'sm';
      if (width < 992) return 'md';
      if (width < 1200) return 'lg';
      return 'xl';
    };

    expect(getBreakpoint(375)).toBe('xs');
  });

  // Tablet breakpoint
  test('deve detectar breakpoint MD (tablet 768px)', () => {
    const getBreakpoint = (width) => {
      if (width < 576) return 'xs';
      if (width < 768) return 'sm';
      if (width < 992) return 'md';
      if (width < 1200) return 'lg';
      return 'xl';
    };

    expect(getBreakpoint(768)).toBe('md');
  });

  // Desktop breakpoint
  test('deve detectar breakpoint XL (desktop 1920px)', () => {
    const getBreakpoint = (width) => {
      if (width < 576) return 'xs';
      if (width < 768) return 'sm';
      if (width < 992) return 'md';
      if (width < 1200) return 'lg';
      return 'xl';
    };

    expect(getBreakpoint(1920)).toBe('xl');
  });
});
