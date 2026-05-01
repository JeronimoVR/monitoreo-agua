import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parametro } from './ircaMotorReglas/entities/parametros.entity';
import { ClasificacionIrca } from './ircaMotorReglas/entities/clasificacionesIRCA.entity';
import { Estacion } from './estaciones/entities/estacion.entity';
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

    const paramCount = await this.parametrosRepository.count();
    if (paramCount === 0) {
      await this.parametrosRepository.save([
        {
          nombre: 'pH',
          unidadMedida: 'Unidades',
          valorMinimo: 6.5,
          valorMaximo: 9.0,
          puntajeRiesgo: 1.5,
          descripcion: 'Nivel de acidez o alcalinidad.'
        },
        {
          nombre: 'Turbidez',
          unidadMedida: 'UNT',
          valorMinimo: 0.0,
          valorMaximo: 2.0,
          puntajeRiesgo: 15.0,
          descripcion: 'Claridad del agua.'
        },
        {
          nombre: 'Conductividad',
          unidadMedida: 'µS/cm',
          valorMinimo: 0.0,
          valorMaximo: 1000.0,
          puntajeRiesgo: 0.0,
          descripcion: 'Sales disueltas.'
        },
        {
          nombre: 'Temperatura',
          unidadMedida: '°C',
          valorMinimo: 15.0,
          valorMaximo: 30.0,
          puntajeRiesgo: 0.0,
          descripcion: 'Temperatura ambiente.'
        },
        {
          nombre: 'Oxígeno Disuelto',
          unidadMedida: 'mg/L',
          valorMinimo: 4.0,
          valorMaximo: 10.0,
          puntajeRiesgo: 0.0,
          descripcion: 'Oxígeno gaseoso disuelto en el agua.'
        }
      ]);
      console.log('✅ Parámetros oficiales sembrados');
    }

    const ircaCount = await this.clasificacionesIrcaRepository.count();
    if (ircaCount === 0) {
      await this.clasificacionesIrcaRepository.save([
        { clasificacion: 'SIN RIESGO', valor_min: 0, valor_max: 5, descripcion: 'Agua apta para consumo.' },
        { clasificacion: 'RIESGO BAJO', valor_min: 5.1, valor_max: 14, descripcion: 'Requiere vigilancia.' },
        { clasificacion: 'RIESGO MEDIO', valor_min: 14.1, valor_max: 35, descripcion: 'Riesgo significativo.' },
        { clasificacion: 'RIESGO ALTO', valor_min: 35.1, valor_max: 80, descripcion: 'Agua no apta.' },
        { clasificacion: 'INVIABLE', valor_min: 80.1, valor_max: 100, descripcion: 'Riesgo total.' }
      ]);
      console.log('✅ Clasificaciones IRCA sembradas');
    }

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