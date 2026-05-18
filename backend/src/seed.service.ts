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
        descripcion: 'Mide la acidez o alcalinidad del agua. Un pH fuera de 6.5-9.0 puede ser corrosivo o causar incrustaciones, afectando la potabilidad.'
      },
      {
        nombre: 'Turbidez',
        unidadMedida: 'UNT',
        valorMinimo: 0.0,
        valorMaximo: 2.0,
        puntajeRiesgo: 15.0,
        descripcion: 'Mide la claridad del agua. Valores superiores a 2 UNT indican presencia de partículas que pueden proteger patógenos y dificultar la desinfección.'
      },
      {
        nombre: 'Conductividad',
        unidadMedida: 'µS/cm',
        valorMinimo: 0.0,
        valorMaximo: 1000.0,
        puntajeRiesgo: 0.0,
        descripcion: 'Mide la capacidad del agua para conducir electricidad, relacionada con sales disueltas. Valores altos pueden indicar contaminación mineral o salina.'
      },
      {
        nombre: 'Temperatura',
        unidadMedida: '°C',
        valorMinimo: 15.0,
        valorMaximo: 30.0,
        puntajeRiesgo: 0.0,
        descripcion: 'Parámetro físico crítico que influye en la solubilidad del oxígeno y la velocidad de reacciones químicas y biológicas en el agua.'
      },
      {
        nombre: 'Oxígeno Disuelto',
        unidadMedida: 'mg/L',
        valorMinimo: 4.0,
        valorMaximo: 10.0,
        puntajeRiesgo: 0.0,
        descripcion: 'Cantidad de oxígeno gaseoso disuelto. Fundamental para la vida acuática y un indicador clave de la capacidad de autodepuración del agua.'
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
      { clasificacion: 'SIN RIESGO', valor_min: 0, valor_max: 5, descripcion: 'Agua apta para consumo humano. No se observan desviaciones significativas en los parámetros analizados.' },
      { clasificacion: 'RIESGO BAJO', valor_min: 5.1, valor_max: 14, descripcion: 'Agua con riesgo mínimo. Se recomienda vigilancia continua para prevenir incrementos en la vulnerabilidad del sistema.' },
      { clasificacion: 'RIESGO MEDIO', valor_min: 14.1, valor_max: 35, descripcion: 'Agua con riesgo moderado. Requiere acciones correctivas inmediatas para mitigar posibles impactos en la salud pública.' },
      { clasificacion: 'RIESGO ALTO', valor_min: 35.1, valor_max: 80, descripcion: 'Agua no apta para consumo. Riesgo significativo para la salud. Requiere intervención técnica urgente y aviso a la comunidad.' },
      { clasificacion: 'INVIABLE', valor_min: 80.1, valor_max: 100, descripcion: 'Agua altamente peligrosa. Consumo prohibido. Estado crítico del recurso hídrico que requiere medidas de emergencia sanitaria.' }
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