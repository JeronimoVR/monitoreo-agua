import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IrcaMotorReglasService } from './ircaClasificacion.service';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

describe('CPU-MON-004 - Clasificación de IRCA', () => {
  let service: IrcaMotorReglasService;
  let parametroRepo: Repository<Parametro>;
  let clasificacionRepo: Repository<ClasificacionIrca>;

  const mockParametros: Parametro[] = [
    { id: 1, nombre: 'Turbiedad', valorMinimo: 0, valorMaximo: 2, puntajeRiesgo: 15 } as Parametro,
    { id: 2, nombre: 'pH', valorMinimo: 6.5, valorMaximo: 9, puntajeRiesgo: 1.5 } as Parametro,
    { id: 3, nombre: 'Cloro Residual', valorMinimo: 0.3, valorMaximo: 2, puntajeRiesgo: 15 } as Parametro,
    { id: 4, nombre: 'Coliformes Totales', valorMinimo: 0, valorMaximo: 0, puntajeRiesgo: 15 } as Parametro,
    { id: 5, nombre: 'E. Coli', valorMinimo: 0, valorMaximo: 0, puntajeRiesgo: 25 } as Parametro,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IrcaMotorReglasService,
        {
          provide: getRepositoryToken(Parametro),
          useValue: {
            findBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClasificacionIrca),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IrcaMotorReglasService>(IrcaMotorReglasService);
    parametroRepo = module.get<Repository<Parametro>>(getRepositoryToken(Parametro));
    clasificacionRepo = module.get<Repository<ClasificacionIrca>>(getRepositoryToken(ClasificacionIrca));
  });

  it('debe clasificar como "SIN RIESGO" cuando el IRCA es 0%', async () => {
    const medidas = [
      { id_parametro: 1, valor: 1.2 },
      { id_parametro: 2, valor: 7.4 },
      { id_parametro: 3, valor: 1.5 },
    ];

    const mockClasificacion = {
      id: 1,
      clasificacion: 'SIN RIESGO',
      valor_min: 0,
      valor_max: 5,
      descripcion: 'Agua apta para consumo humano',
    } as ClasificacionIrca;

    jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([
      mockParametros[0],
      mockParametros[1],
      mockParametros[2],
    ]);
    jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

    const resultado = await service.calcularIrca(medidas);

    expect(resultado.puntaje).toBe(0);
    expect(resultado.clasificacion?.clasificacion).toBe('SIN RIESGO');
  });

  it('debe clasificar como "RIESGO BAJO" cuando el IRCA esté entre 5.1% y 14%', async () => {
    const parametroBajo1 = { id: 10, valorMinimo: 1, valorMaximo: 5, puntajeRiesgo: 6.0 } as Parametro;
    const parametroBajo2 = { id: 11, valorMinimo: 1, valorMaximo: 5, puntajeRiesgo: 37.0 } as Parametro;

    const mockClasificacion = {
      id: 2,
      clasificacion: 'RIESGO BAJO',
      valor_min: 5.1,
      valor_max: 14,
      descripcion: 'Agua no apta, requiere mejora',
    } as ClasificacionIrca;

    jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([parametroBajo1, parametroBajo2]);
    jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

    const resultado = await service.calcularIrca([
      { id_parametro: 10, valor: 10 },
      { id_parametro: 11, valor: 3 },
    ]);

    expect(resultado.puntaje).toBe(13.95);
    expect(resultado.clasificacion?.clasificacion).toBe('RIESGO BAJO');
  });

  it('debe clasificar como "RIESGO MEDIO" cuando el IRCA esté entre 14.1% y 35%', async () => {
    const p1 = { id: 20, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 15 } as Parametro;
    const p2 = { id: 21, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 44 } as Parametro;

    const mockClasificacion = {
      id: 3,
      clasificacion: 'RIESGO MEDIO',
      valor_min: 14.1,
      valor_max: 35,
      descripcion: 'Riesgo moderado para la salud',
    } as ClasificacionIrca;

    jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([p1, p2]);
    jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

    const resultado = await service.calcularIrca([
      { id_parametro: 20, valor: 10 },
      { id_parametro: 21, valor: 2 },
    ]);

    expect(resultado.puntaje).toBe(25.42);
    expect(resultado.clasificacion?.clasificacion).toBe('RIESGO MEDIO');
  });

  it('debe clasificar como "RIESGO ALTO" cuando el IRCA esté entre 35.1% y 80%', async () => {
    const medidas = [
      { id_parametro: 1, valor: 4.5 },
      { id_parametro: 2, valor: 7.0 },
      { id_parametro: 3, valor: 1.2 },
    ];

    const mockClasificacion = {
      id: 4,
      clasificacion: 'RIESGO ALTO',
      valor_min: 35.1,
      valor_max: 80,
      descripcion: 'Alto riesgo, requiere intervención urgente',
    } as ClasificacionIrca;

    jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([
      mockParametros[0],
      mockParametros[1],
      mockParametros[2],
    ]);
    jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

    const resultado = await service.calcularIrca(medidas);

    expect(resultado.puntaje).toBe(47.62);
    expect(resultado.clasificacion?.clasificacion).toBe('RIESGO ALTO');
  });

  it('debe clasificar como "INVIABLE SANITARIAMENTE" cuando el IRCA esté entre 80.1% y 100%', async () => {
    const medidas = [
      { id_parametro: 1, valor: 8.0 },
      { id_parametro: 3, valor: 0.0 },
      { id_parametro: 5, valor: 4.0 },
    ];

    const mockClasificacion = {
      id: 5,
      clasificacion: 'INVIABLE SANITARIAMENTE',
      valor_min: 80.1,
      valor_max: 100,
      descripcion: 'Agua completamente inviable para consumo',
    } as ClasificacionIrca;

    jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([
      mockParametros[0],
      mockParametros[2],
      mockParametros[4],
    ]);
    jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

    const resultado = await service.calcularIrca(medidas);

    expect(resultado.puntaje).toBe(100);
    expect(resultado.clasificacion?.clasificacion).toBe('INVIABLE SANITARIAMENTE');
  });
});