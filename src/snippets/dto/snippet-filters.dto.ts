import {
  IsOptional,
  IsString,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class SnippetFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  programmingLanguage?: string;
}
