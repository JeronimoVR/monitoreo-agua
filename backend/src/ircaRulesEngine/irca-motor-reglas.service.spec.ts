import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IrcaMotorReglasService } from './ircaClasificacion.service';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

describe('IrcaMotorReglasService', () => {
    let service: IrcaMotorReglasService;
    let parametroRepo: Repository<Parametro>;
    let clasificacionRepo: Repository<ClasificacionIrca>;

    // Datos simulados de parámetros comunes con sus puntajes de riesgo reales
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

    it('debe estar definido el servicio', () => {
        expect(service).toBeDefined();
    });

    describe('Calcular IRCA - Clasificaciones de Riesgo', () => {
        
        it('1. Debe clasificar como "SIN RIESGO" cuando el IRCA es 0% (Todos los parámetros cumplen)', async () => {
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
                descripcion: 'Agua apta para consumo humano' 
            } as ClasificacionIrca;

            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([mockParametros[0], mockParametros[1], mockParametros[2]]);
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacion);

            const resultado = await service.calcularIrca(medidas);

            expect(resultado.puntaje).toBe(0); 
            expect(resultado.clasificacion).toEqual(mockClasificacion);
        });

        it('2. Debe clasificar como "RIESGO BAJO" (IRCA entre 5.1% y 14%)', async () => {
            const parametroBajo1 = { id: 10, valorMinimo: 1, valorMaximo: 5, puntajeRiesgo: 6.0 } as Parametro;
            const parametroBajo2 = { id: 11, valorMinimo: 1, valorMaximo: 5, puntajeRiesgo: 37.0 } as Parametro;
            
            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([parametroBajo1, parametroBajo2]);
            
            const mockClasificacionBaja = { 
                id: 2, 
                clasificacion: 'RIESGO BAJO', 
                valor_min: 5.1, 
                valor_max: 14, 
                descripcion: 'Agua no apta, requiere mejora' 
            } as ClasificacionIrca;
            
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacionBaja);

            const resultado = await service.calcularIrca([
                { id_parametro: 10, valor: 10 }, 
                { id_parametro: 11, valor: 3 }   
            ]); // (6 / 43) * 100 = 13.95%

            expect(resultado.puntaje).toBe(13.95);
            expect(resultado.clasificacion?.clasificacion).toBe('RIESGO BAJO');
        });

        it('3. Debe clasificar como "RIESGO MEDIO" (IRCA entre 14.1% y 35%)', async () => {
            const p1 = { id: 20, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 15 } as Parametro;
            const p2 = { id: 21, valorMinimo: 0, valorMaximo: 5, puntajeRiesgo: 44 } as Parametro;

            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([p1, p2]);
            
            const mockClasificacionMedia = { 
                id: 3, 
                clasificacion: 'RIESGO MEDIO', 
                valor_min: 14.1, 
                valor_max: 35, 
                descripcion: 'Riesgo moderado para la salud' 
            } as ClasificacionIrca;
            
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacionMedia);

            const resultado = await service.calcularIrca([
                { id_parametro: 20, valor: 10 }, 
                { id_parametro: 21, valor: 2 }   
            ]); // (15 / 59) * 100 = 25.42%

            expect(resultado.puntaje).toBe(25.42);
            expect(resultado.clasificacion?.clasificacion).toBe('RIESGO MEDIO');
        });

        it('4. Debe clasificar como "RIESGO ALTO" (IRCA entre 35.1% y 80%)', async () => {
            const medidas = [
                { id_parametro: 1, valor: 4.5 }, 
                { id_parametro: 2, valor: 7.0 }, 
                { id_parametro: 3, valor: 1.2 }, 
            ]; 

            const mockClasificacionAlta = { 
                id: 4, 
                clasificacion: 'RIESGO ALTO', 
                valor_min: 35.1, 
                valor_max: 80, 
                descripcion: 'Alto riesgo, requiere intervención urgente' 
            } as ClasificacionIrca;

            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([mockParametros[0], mockParametros[1], mockParametros[2]]);
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacionAlta);

            const resultado = await service.calcularIrca(medidas);

            expect(resultado.puntaje).toBe(47.62);
            expect(resultado.clasificacion?.clasificacion).toBe('RIESGO ALTO');
        });

        it('5. Debe clasificar como "INVIABLE SANITARIAMENTE" (IRCA entre 80.1% y 100%)', async () => {
            const medidas = [
                { id_parametro: 1, valor: 8.0 }, 
                { id_parametro: 3, valor: 0.0 }, 
                { id_parametro: 5, valor: 4.0 }, 
            ]; 

            const mockClasificacionInviable = { 
                id: 5, 
                clasificacion: 'INVIABLE SANITARIAMENTE', 
                valor_min: 80.1, 
                valor_max: 100, 
                descripcion: 'Agua completamente inviable para consumo' 
            } as ClasificacionIrca;

            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([mockParametros[0], mockParametros[2], mockParametros[4]]);
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(mockClasificacionInviable);

            const resultado = await service.calcularIrca(medidas);

            expect(resultado.puntaje).toBe(100);
            expect(resultado.clasificacion?.clasificacion).toBe('INVIABLE SANITARIAMENTE');
        });
    });

    describe('Validaciones y Excepciones (Manejo de Errores)', () => {

        it('Debe lanzar BadRequestException si el array de medidas está vacío', async () => {
            await expect(service.calcularIrca([])).rejects.toThrow(
                new BadRequestException('No se enviaron medidas para calcular IRCA')
            );
        });

        it('Debe lanzar BadRequestException si los datos de las medidas son inválidos o no numéricos', async () => {
            const medidasInvalidas = [
                { id_parametro: NaN, valor: 5 },
                { id_parametro: 1, valor: null as any }
            ];

            await expect(service.calcularIrca(medidasInvalidas)).rejects.toThrow(
                new BadRequestException('Existen medidas incompletas o no numéricas; no es posible calcular IRCA')
            );
        });

        it('Debe lanzar NotFoundException si alguno de los id_parametro no existe en la BD', async () => {
            const medidas = [
                { id_parametro: 1, valor: 2.0 },
                { id_parametro: 99, valor: 4.5 } 
            ];

            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([mockParametros[0]]); 

            await expect(service.calcularIrca(medidas)).rejects.toThrow(
                new NotFoundException('No existen parámetros configurados para los IDs: 99')
            );
        });

        it('Debe retornar puntaje 0 si los parámetros analizados tienen peso (puntajeRiesgo) igual a 0', async () => {
            const typeofClasificacion = { 
                id: 1, 
                clasificacion: 'SIN RIESGO', 
                valor_min: 0, 
                valor_max: 5, 
                descripcion: 'Sin riesgo' 
            } as ClasificacionIrca;

            const parametroSinPeso = { id: 8, nombre: 'Color falso', valorMinimo: 0, valorMaximo: 10, puntajeRiesgo: 0 } as Parametro;
            
            jest.spyOn(parametroRepo, 'findBy').mockResolvedValue([parametroSinPeso]);
            jest.spyOn(clasificacionRepo, 'findOne').mockResolvedValue(typeofClasificacion);

            const resultado = await service.calcularIrca([{ id_parametro: 8, valor: 50 }]); 
            
            expect(resultado.puntaje).toBe(0);
        });
    });
});