import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parametro } from './ircaRulesEngine/entities/parametros.entity';
import { ClasificacionIrca } from './ircaRulesEngine/entities/clasificacionesIRCA.entity';
import { Estacion } from './stations/entities/estacion.entity';
import { Usuario } from './users/entities/usuario.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Parametro) private parametrosRepository: Repository<Parametro>,
    @InjectRepository(ClasificacionIrca) private clasificacionesIrcaRepository: Repository<ClasificacionIrca>,
    @InjectRepository(Estacion) private estacionesRepository: Repository<Estacion>,
    @InjectRepository(Usuario) private usuariosRepository: Repository<Usuario>,
  ) { }

  /**
   * Método del ciclo de vida de NestJS que se ejecuta automáticamente
   * una vez que todos los módulos han sido inicializados.
   */
  async onApplicationBootstrap() {
    await this.ejecutarSeeds();
  }

  /**
   * Ejecuta el proceso de siembra de datos (seeding).
   * Verifica la existencia de registros y, si no existen, inserta
   * estaciones, parámetros iniciales y clasificaciones IRCA.
   */
  async ejecutarSeeds() {
    console.log('🌱 Iniciando Seeding de base de datos...');

    const estacionCount = await this.estacionesRepository.count();
    if (estacionCount === 0) {
      await this.estacionesRepository.save([
        { id: 1, nombre: 'Sitio de prueba', latitud: 3.3225, longitud: -76.2341 }
      ]);
      console.log('✅ Estaciones sembradas');
    }

    const parameters = [
      {
        nombre: 'pH',
        unidadMedida: 'Unidades',
        valorMinimo: 6.5,
        valorMaximo: 9.0,
        puntajeRiesgo: 1.5,
        descripcion: 'Mide la acidez. Fuera de rango, el agua se vuelve corrosiva o irritante.'
      },
      {
        nombre: 'Turbidez',
        unidadMedida: 'UNT',
        valorMinimo: 0.0,
        valorMaximo: 2.0,
        puntajeRiesgo: 1.5,
        descripcion: 'Claridad visual. Indica presencia de lodo o suciedad que impide el paso de la luz.'
      },
      {
        nombre: 'Conductividad',
        unidadMedida: 'µS/cm',
        valorMinimo: 0.0,
        valorMaximo: 1000.0,
        puntajeRiesgo: 1.5,
        descripcion: 'Sales disueltas. Un nivel alto indica exceso de minerales o residuos invisibles.'
      },
      {
        nombre: 'Temperatura',
        unidadMedida: '°C',
        valorMinimo: 15.0,
        valorMaximo: 30.0,
        puntajeRiesgo: 1.5,
        descripcion: 'Grado de calor. Influye en la vida acuática y la velocidad de descomposición del agua.'
      },
      {
        nombre: 'Oxígeno Disuelto',
        unidadMedida: 'mg/L',
        valorMinimo: 4.0,
        valorMaximo: 10.0,
        puntajeRiesgo: 1.5,
        descripcion: 'Aire en el agua. Fundamental para evitar malos olores y mantener la vida acuática.'
      }
    ];

    for (const param of parameters) {
      const existing = await this.parametrosRepository.findOne({ where: { nombre: param.nombre } });
      if (existing) {
        await this.parametrosRepository.update(existing.id, param);
      } else {
        await this.parametrosRepository.save(param);
      }
    }
    console.log('✅ Parámetros oficiales sembrados/actualizados');

    const classifications = [
      { clasificacion: 'SIN RIESGO', valor_min: 0, valor_max: 5, descripcion: 'El agua del arroyo está en buenas condiciones fisicoquímicas, garantizando un ecosistema adecuado para la preservación de la biodiversidad.' },
      { clasificacion: 'BAJO', valor_min: 5.1, valor_max: 14, descripcion: 'El agua del arroyo presenta ligeras variaciones en sus condiciones fisicoquímicas. Aunque el ecosistema mantiene su estabilidad, es recomendable realizar seguimiento para prevenir afectaciones a la biodiversidad.' },
      { clasificacion: 'MEDIO', valor_min: 14.1, valor_max: 35, descripcion: 'El agua del arroyo presenta alteraciones moderadas en sus condiciones fisicoquímicas, lo que puede generar estrés en algunas especies acuáticas y afectar parcialmente el equilibrio del ecosistema.' },
      { clasificacion: 'ALTO', valor_min: 35.1, valor_max: 80, descripcion: 'El agua del arroyo presenta un deterioro significativo en sus condiciones fisicoquímicas, comprometiendo la salud de los organismos acuáticos y reduciendo la capacidad del ecosistema para sostener la biodiversidad.' },
      { clasificacion: 'INVIABLE', valor_min: 80.1, valor_max: 100, descripcion: 'El agua del arroyo presenta condiciones críticas de calidad, generando un alto impacto sobre los organismos acuáticos y poniendo en riesgo la estabilidad y supervivencia de la biodiversidad presente en el ecosistema.' }
    ];

    for (const config of classifications) {
      const existing = await this.clasificacionesIrcaRepository.findOne({ where: { clasificacion: config.clasificacion } });
      if (existing) {
        await this.clasificacionesIrcaRepository.update(existing.id, config);
      } else {
        await this.clasificacionesIrcaRepository.save(config);
      }
    }
    console.log('✅ Clasificaciones IRCA sembradas/actualizados');

    const usuarioCount = await this.usuariosRepository.count();
    if (usuarioCount === 0) {
      await this.usuariosRepository.save([
        { nombre: 'Admin', correo: 'finnbalorjero5@gmail.com', passwordHash: 'admin123' },
        { nombre: 'Usuario', correo: 'jvelezr@estudiante.uniajc.edu.co', passwordHash: 'usuario123' },
      ]);
      console.log('✅ Usuarios sembrados');
    }
  }
}