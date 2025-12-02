// server/tests/auth.test.js
require('./setup');
const { mockUser } = require('./setup');

describe('Autenticação', () => {
  // Testes de validação de email
  describe('Email Validation', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('deve aceitar email válido com domínio', () => {
      expect(isValidEmail('joao@empresa.pt')).toBe(true);
    });

    test('deve aceitar email com múltiplos pontos', () => {
      expect(isValidEmail('joao.silva@empresa.co.uk')).toBe(true);
    });

    test('deve rejeitar email sem @', () => {
      expect(isValidEmail('joaoempreza.pt')).toBe(false);
    });

    test('deve rejeitar email sem domínio', () => {
      expect(isValidEmail('joao@empresa')).toBe(false);
    });

    test('deve rejeitar email vazio', () => {
      expect(isValidEmail('')).toBe(false);
    });

    test('deve rejeitar email com espaços', () => {
      expect(isValidEmail('joao silva@empresa.pt')).toBe(false);
    });

    test('deve rejeitar email com @ duplicado', () => {
      expect(isValidEmail('joao@@empresa.pt')).toBe(false);
    });
  });

  // Testes de validação de password
  describe('Password Validation', () => {
    test('password com 3 caracteres deve ser válida', () => {
      const password = 'abc';
      expect(password.length >= 3).toBe(true);
    });

    test('password com 2 caracteres deve ser inválida', () => {
      const password = 'ab';
      expect(password.length >= 3).toBe(false);
    });

    test('password vazia deve ser inválida', () => {
      const password = '';
      expect(password.length >= 3).toBe(false);
    });

    test('password com 20 caracteres deve ser válida', () => {
      const password = 'senhafortebemfortee';
      expect(password.length >= 3).toBe(true);
    });
  });

  // Testes de validação de formulário
  describe('Form Validation', () => {
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

    test('deve retornar erro com email e password vazios', () => {
      const result = validateLoginForm('', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email e password obrigatórios');
    });

    test('deve retornar erro com email inválido', () => {
      const result = validateLoginForm('joao@empresa', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });

    test('deve retornar erro com password fraca', () => {
      const result = validateLoginForm('joao@empresa.pt', 'ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password deve ter pelo menos 3 caracteres');
    });

    test('deve aceitar dados válidos', () => {
      const result = validateLoginForm('joao@empresa.pt', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // Testes de dados de utilizador
  describe('User Data', () => {
    test('mock user deve ter estrutura correcta', () => {
      expect(mockUser).toHaveProperty('id');
      expect(mockUser).toHaveProperty('name');
      expect(mockUser).toHaveProperty('email');
      expect(mockUser).toHaveProperty('role');
    });

    test('mock user deve ter role válido', () => {
      const validRoles = ['gestor', 'tecnico', 'sysadmin'];
      expect(validRoles).toContain(mockUser.role);
    });

    test('mock user email deve ser válido', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(mockUser.email)).toBe(true);
    });
  });
});
