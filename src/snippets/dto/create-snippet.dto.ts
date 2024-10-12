import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  MaxLength,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";

export class CreateSnippetDto {
  @ApiProperty({ description: "The title of the snippet", maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({
    required: false,
    description: "A brief description of the snippet",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description?: string;

  @ApiProperty({ description: "The content of the snippet" })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: "Tags associated with the snippet",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Transform(({ value }: TransformFnParams) =>
    value.map((tag: string) => tag.toLowerCase().trim()),
  )
  tags: string[];

  @ApiProperty({
    description: "The programming programmingLanguage of the snippet",
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.toLowerCase().trim())
  programmingLanguage: string;

  @ApiProperty({
    description: "Whether the snippet is public or private",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
