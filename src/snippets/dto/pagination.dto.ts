import {
  IsOptional,
  IsPositive,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 10;
}