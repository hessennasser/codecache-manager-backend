import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for specific origin
  app.enableCors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    methods: "GET,POST,PUT,DELETE,OPTIONS", // Allowed HTTP methods
    allowedHeaders: "Content-Type, Authorization", // Allowed headers in the request
    credentials: true, // Allow cookies and other credentials
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Your API Title")
    .setDescription("API Description")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3001);
}
bootstrap();
