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
export class Tag extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  usageCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
