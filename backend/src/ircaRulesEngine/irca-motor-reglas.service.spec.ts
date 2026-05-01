import { Test, TestingModule } from '@nestjs/testing';
import { IrcaMotorReglasService } from './ircaClasificacion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

describe('IrcaMotorReglasService (QA - CU002)', () => {
  let service: IrcaMotorReglasService;
  
  // Mocks de Repositorios
  const mockParametroRepo = {
    findOneBy: jest.fn(),
  };

  const mockClasificacionRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IrcaMotorReglasService,
        { provide: getRepositoryToken(Parametro), useValue: mockParametroRepo },
        { provide: getRepositoryToken(ClasificacionIrca), useValue: mockClasificacionRepo },
      ],
    }).compile();

    service = module.get<IrcaMotorReglasService>(IrcaMotorReglasService);
    jest.clearAllMocks();
  });

  describe('calcularIrca (Integración de Reglas)', () => {
    
    it('CU002: Debería calcular 0% cuando todos los parámetros están en rango', async () => {
      // Configuración de parámetros de prueba (PH y Turbiedad)
      mockParametroRepo.findOneBy
        .mockResolvedValueOnce({ id: 1, valorMinimo: 6.5, valorMaximo: 9.0, puntajeRiesgo: 1.5 }) // PH
        .mockResolvedValueOnce({ id: 2, valorMinimo: 0, valorMaximo: 2.0, puntajeRiesgo: 15 });   // Turbiedad

      const medidas = [
        { id_parametro: 1, valor: 7.0 }, // En rango
        { id_parametro: 2, valor: 1.0 }, // En rango
      ];

      const result = await service.calcularIrca(medidas);

      expect(result.puntaje).toBe(0);
    });

    it('CU002: Debería calcular el porcentaje correcto cuando hay incumplimiento', async () => {
      // Simulamos dos parámetros con el mismo peso (50 y 50) para facilitar el cálculo
      mockParametroRepo.findOneBy
        .mockResolvedValueOnce({ id: 1, valorMinimo: 0, valorMaximo: 10, puntajeRiesgo: 50 })
        .mockResolvedValueOnce({ id: 2, valorMinimo: 0, valorMaximo: 10, puntajeRiesgo: 50 });

      const medidas = [
        { id_parametro: 1, valor: 5 },  // Cumple
        { id_parametro: 2, valor: 20 }, // Incumple (Aporta sus 50 puntos de riesgo)
      ];

      // El total analizado es 100. El incumplido es 50. (50/100)*100 = 50%
      const result = await service.calcularIrca(medidas);

      expect(result.puntaje).toBe(50);
    });

    it('CU002: Debería retornar la clasificación obtenida de la base de datos', async () => {
      mockParametroRepo.findOneBy.mockResolvedValue({ id: 1, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 10 });
      
      const mockClasificacion = { id: 1, nombre: 'RIESGO BAJO', valor_min: 0.1, valor_max: 14 };
      mockClasificacionRepo.findOne.mockResolvedValue(mockClasificacion);

      const medidas = [{ id_parametro: 1, valor: 10 }]; // Incumple
      const result = await service.calcularIrca(medidas);

      expect(result.clasificacion).toEqual(mockClasificacion);
      expect(mockClasificacionRepo.findOne).toHaveBeenCalled();
    });

    it('Debería ignorar parámetros con peso 0 en el cálculo', async () => {
      mockParametroRepo.findOneBy.mockResolvedValue({ id: 1, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 0 });

      const medidas = [{ id_parametro: 1, valor: 10 }]; // Incumple, pero peso es 0
      const result = await service.calcularIrca(medidas);

      expect(result.puntaje).toBe(0);
    });

    it('Debería manejar casos donde el parámetro no existe en la base de datos', async () => {
      mockParametroRepo.findOneBy.mockResolvedValue(null);

      const medidas = [{ id_parametro: 999, valor: 10 }];
      const result = await service.calcularIrca(medidas);

      expect(result.puntaje).toBe(0); // Al no haber parámetros válidos, la suma total es 0
    });
  });
});