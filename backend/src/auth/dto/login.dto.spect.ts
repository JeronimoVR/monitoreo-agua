import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('CPU-AUT-001 - Validación de formato de correo', () => {
  it('debe aceptar un correo con formato válido', async () => {
    const dto = new LoginDto();
    dto.correo = 'marvinsantiago201318@gmail.com';
    dto.password = 'Clave123*';

    const errors = await validate(dto);

    const correoErrors = errors.filter(error => error.property === 'correo');
    expect(correoErrors.length).toBe(0);
  });

  it('debe rechazar un correo con formato inválido', async () => {
    const dto = new LoginDto();
    dto.correo = 'marvinsantiago201318gmail.com';
    dto.password = 'Clave123*';

    const errors = await validate(dto);

    const correoError = errors.find(error => error.property === 'correo');
    expect(correoError).toBeDefined();
    expect(correoError?.constraints).toHaveProperty('isEmail');
  });
});