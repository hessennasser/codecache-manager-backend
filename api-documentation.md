# API Documentation

## Users Controller

The Users Controller handles CRUD operations for user management. It provides endpoints for creating, reading, updating, and deleting user records.

### Base URL: `/users`

### Endpoints

#### 1. Create User

- **Method**: POST
- **Endpoint**: `/`
- **Description**: Creates a new user
- **Authentication**: Not required
- **Request Body**: CreateUserDto
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: UserResponseDto
  ```json
  {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "role": "string",
    "isActive": true,
    "createdAt": "2023-09-20T00:00:00.000Z",
    "updatedAt": "2023-09-20T00:00:00.000Z"
  }
  ```
- **Status Codes**:
  - 201: User created successfully
  - 400: Bad request (validation error)

#### 2. Get All Users

- **Method**: GET
- **Endpoint**: `/`
- **Description**: Retrieves a paginated list of all users
- **Authentication**: Required (JWT)
- **Authorization**: Admin role required
- **Query Parameters**:
  - page (optional, default: 1): Page number
  - limit (optional, default: 10): Number of items per page
- **Response**:
  ```json
  {
    "data": [UserResponseDto],
    "total": number,
    "page": number,
    "lastPage": number
  }
  ```
- **Status Codes**:
  - 200: Successfully retrieved users
  - 401: Unauthorized
  - 403: Forbidden (insufficient permissions)

#### 3. Get User by ID

- **Method**: GET
- **Endpoint**: `/:id`
- **Description**: Retrieves a specific user by their ID
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - id: User's unique identifier
- **Response**: UserResponseDto
- **Status Codes**:
  - 200: Successfully retrieved user
  - 401: Unauthorized
  - 404: User not found

#### 4. Update User

- **Method**: PATCH
- **Endpoint**: `/:id`
- **Description**: Updates a specific user's information
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - id: User's unique identifier
- **Request Body**: UpdateUserDto (partial CreateUserDto)
- **Response**: UserResponseDto
- **Status Codes**:
  - 200: User updated successfully
  - 401: Unauthorized
  - 404: User not found

#### 5. Delete User

- **Method**: DELETE
- **Endpoint**: `/:id`
- **Description**: Deletes a specific user
- **Authentication**: Required (JWT)
- **Authorization**: Admin role required
- **Path Parameters**:
  - id: User's unique identifier
- **Response**: No content
- **Status Codes**:
  - 200: User deleted successfully
  - 401: Unauthorized
  - 403: Forbidden (insufficient permissions)
  - 404: User not found

## Auth Controller

The Auth Controller handles user authentication operations including registration, login, and logout.

### Base URL: `/auth`

### Endpoints

#### 1. Register

- **Method**: POST
- **Endpoint**: `/register`
- **Description**: Registers a new user
- **Authentication**: Not required
- **Request Body**: CreateUserDto
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: UserResponseDto
- **Status Codes**:
  - 201: User successfully registered
  - 400: Bad request (validation error or user already exists)

#### 2. Login

- **Method**: POST
- **Endpoint**: `/login`
- **Description**: Authenticates a user and returns a JWT token
- **Authentication**: Local strategy (username/password)
- **Request Body**: LoginDto
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "user": UserResponseDto
  }
  ```
- **Status Codes**:
  - 200: User successfully logged in
  - 401: Unauthorized (invalid credentials)

#### 3. Logout

- **Method**: POST
- **Endpoint**: `/logout`
- **Description**: Logs out the current user
- **Authentication**: Required (JWT)
- **Response**: Message confirming logout
- **Status Codes**:
  - 200: User successfully logged out
  - 401: Unauthorized

### Security

Both controllers use various security measures:

1. JWT Authentication: Most endpoints require a valid JWT token in the Authorization header.
2. Role-Based Access Control: Some endpoints (like user deletion) require specific roles.
3. Data Validation: All incoming data is validated using DTOs.
4. Data Transformation: Sensitive data (like passwords) is excluded from responses using ClassSerializerInterceptor.

### Error Handling

Both controllers use NestJS's built-in exception filters to handle errors. Common HTTP status codes are used to indicate the result of each operation.

### Swagger Documentation

Both controllers are decorated with Swagger annotations (@ApiTags, @ApiResponse, etc.) for automatic API documentation generation. You can access the Swagger UI at `/api` when running the application in development mode.
