import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Tag } from "./tag.schema";

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
export class Snippet extends Document {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true })
  content: string;

  @Prop([{ type: Types.ObjectId, ref: "Tag" }])
  tags: Types.ObjectId[];

  @Prop({ required: true, lowercase: true, trim: true })
  programmingLanguage: string; // Changed from 'programmingLanguage' to 'programmingLanguage'

  @Prop({ required: true, type: String, index: true })
  userId: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Number, default: 0 })
  viewCount: number;
}

export const SnippetSchema = SchemaFactory.createForClass(Snippet);

SnippetSchema.index(
  {
    title: "text",
    description: "text",
    content: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      content: 1,
    },
    name: "TextSearchIndex",
  },
);

SnippetSchema.index({ programmingLanguage: 1 });
