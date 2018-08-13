import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ByIdDto } from '../common/dtos';

import { AclService } from './acl.service';
import { AclDto, CreateAclDto, FindAclQueryDto, UpdateAclDto } from './dto';

@ApiUseTags('ACL')
@Controller('acls')
export class AclController {
  constructor(private readonly aclService: AclService) {}

  @Post()
  @ApiOperation({ title: 'Create a new ACL item' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  async create(@Body() createAclDto: CreateAclDto): Promise<void> {
    await this.aclService.create(createAclDto);
  }

  @Get()
  @ApiOperation({ title: 'Find All Acls' })
  @ApiResponse({
    description: 'Returns all roles satisfying the query',
    status: HttpStatus.OK,
    type: AclDto,
    isArray: true,
  })
  async findAll(@Query() filter: FindAclQueryDto) {
    return await this.aclService.find(filter);
  }

  @Put(':id')
  @ApiOperation({ title: 'Update an existing ACL rule' })
  @ApiResponse({
    description: 'An updated ACL rule object',
    status: HttpStatus.OK,
    type: AclDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found.' })
  async update(@Param() params: ByIdDto, @Body() updateAclDto: UpdateAclDto) {
    return await this.aclService.update(params.id, updateAclDto);
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async removeById(@Param() params: ByIdDto) {
    return await this.aclService.removeById(params.id);
  }
}
