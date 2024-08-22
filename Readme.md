# Autobots API

This project is a backend service that generates and manages Autobots. It automatically creates 500 unique Autobots every hour, with each Autobot having 10 posts and each post having 10 comments. The service also provides API endpoints for retrieving Autobots, their posts, and comments, with rate limiting and pagination support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Rate Limiting](#rate-limiting)
- [Database Setup](#database-setup)
- [Contributing](#contributing)

## Features

- **Autobot Generation**: Automatically creates 500 unique Autobots every hour.
- **Post and Comment Creation**: Each Autobot is associated with 10 posts, and each post has 10 comments.
- **API Endpoints**: Retrieve Autobots, posts, and comments with pagination.
- **Rate Limiting**: Ensures no more than 5 requests per minute per developer.
- **Swagger Documentation**: Interactive API documentation available via Swagger UI.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **API Documentation**: Swagger
- **Rate Limiting**: `rate-limiter-flexible`
- **Other**: Axios (for making requests to `jsonplaceholder.typicode.com`)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/autobots-api.git
   cd autobots-api
   ```

````

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up the MySQL database**:

   - Create a new MySQL database.
   - Import the provided `schema.sql` file to create the necessary tables.

4. **Configure environment variables**:
   - Create a `.env` file in the root directory.
   - Add the following environment variables:
     ```
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=yourpassword
     DB_NAME=autobots_db
     ```

## Configuration

### `.env` File

Make sure to create a `.env` file in the root directory with the following content:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=autobots_db
```

Replace `yourpassword` with your actual MySQL password.

## Running the Application

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Access the API**:
   - Base URL: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api-docs`

## API Documentation

### Swagger UI

The API documentation is available via Swagger UI. Once the server is running, navigate to `http://localhost:3000/api-docs` to view and interact with the API documentation.

### Available Endpoints

- **Get all Autobots**: `GET /api/autobots`
- **Get posts by Autobot ID**: `GET /api/autobot/{id}/posts`
- **Get comments by Post ID**: `GET /api/post/{id}/comments`

Each of these endpoints supports pagination and rate limiting.

## Rate Limiting

Each developer is limited to 5 requests per minute, and each request can return only 10 data results. If the limit is exceeded, the server will respond with a `429 Too Many Requests` error.

## Database Setup

The application uses a MySQL database. The `schema.sql` file in the repository contains the SQL statements needed to set up the necessary tables.

To import the schema, use the following command in your MySQL client:

```sql
source path_to_schema.sql;
```

This will create the `Autobots`, `Posts`, and `Comments` tables.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

```
````
