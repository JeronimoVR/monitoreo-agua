import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EstacionesService } from './estaciones.service';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';

@Controller('estaciones')
export class EstacionesController {
    constructor(private readonly estacionesService: EstacionesService) { }

    @Post()
    create(@Body() createEstacionDto: CreateEstacionDto) {
        return this.estacionesService.create(createEstacionDto);
    }

    @Get()
    findAll() {
        return this.estacionesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.estacionesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateEstacionDto: UpdateEstacionDto) {
        return this.estacionesService.update(id, updateEstacionDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.estacionesService.remove(id);
    }
}