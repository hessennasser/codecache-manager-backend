import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret._id;
      return ret;
    },
  },
})

export class Snippet {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true })
  content: string;

  @Prop([{ type: String, lowercase: true, trim: true }])
  tags: string[];

  @Prop({ required: true, lowercase: true, trim: true })
  language: string;

  @Prop({ required: true, type: String, index: true })
  userId: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Number, default: 0 })
  viewCount: number;
}

export type SnippetDocument = Snippet & Document;
export const SnippetSchema = SchemaFactory.createForClass(Snippet);

SnippetSchema.index({
  title: "text",
  description: "text",
  content: "text",
  tags: "text",
});
