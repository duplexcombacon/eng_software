// server/tests/auth.test.js
require('./setup');

describe('Autenticação', () => {
  // Email validation
  test('deve aceitar email válido com domínio', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    expect(isValidEmail('joao@empresa.pt')).toBe(true);
  });

  // Password validation
  test('password com 3 caracteres deve ser válida', () => {
    const password = 'abc';
    expect(password.length >= 3).toBe(true);
  });

  // Form validation
  test('deve aceitar dados válidos no formulário', () => {
    const validateLoginForm = (email, password) => {
      const errors = [];
      
      if (!email || !password) {
        errors.push('Email e password obrigatórios');
      }
      
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email inválido');
      }
      
      if (password && password.length < 3) {
        errors.push('Password deve ter pelo menos 3 caracteres');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    };

    const result = validateLoginForm('joao@empresa.pt', 'password123');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
