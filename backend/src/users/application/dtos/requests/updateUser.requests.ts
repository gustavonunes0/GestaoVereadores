import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.requests';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
