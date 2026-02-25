import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto } from './dto/create-measure.dto';

@Controller()
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  // Este método escuchará el tópico donde publica el ESP32
  @MessagePattern('sensores/lecturas')
  async handleNewMeasure(@Payload() data: CreateMeasureDto) {
    console.log('📥 Mensaje recibido vía MQTT:', data);
    return await this.measuresService.create(data);
  }
}