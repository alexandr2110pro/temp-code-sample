import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AclGuard } from '../../../guards';

@Controller('protected')
@UseGuards(AclGuard)
export class ProtectedController {
  private data: any[] = [{ foo: 'bar' }];

  @Get()
  async findAll(): Promise<any[]> {
    return this.data;
  }

  @Get(':id')
  async findById(): Promise<any[]> {
    return this.data[0];
  }

  @Post()
  async create(@Body() data: any): Promise<void> {
    this.data.push(data);
  }

  @Put(':id')
  async update(@Body() data: any): Promise<any> {
    return { ...data };
  }

  @Delete(':id')
  async remove(@Body() data: any): Promise<any> {
    return { success: true };
  }
}
