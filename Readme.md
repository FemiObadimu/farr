## Farr Shipping API

This repository contains the implementation of a RESTful API for a simplified shipping application. The API supports basic operations such as account creation, payment inquiries, tracking shipments, and checking delivered items in the warehouse. The application is built using Node.js with Express, utilizes MongoDB and Redis, and is containerized using Docker.

## Features
- **Account** Creation: Allows users to create a new account.
- **Payment Inquiry**: Enables users to check payment status for their account.
- **Track Shipments**: Allows tracking of items shipped out of the warehouse.
- **Check Delivered Items**: Checks items that have been delivered to the warehouse.

## Prerequisites
Before you begin, ensure you have the following installed:
Node.js (v18 or above)
Docker
MongoDB
Redis
Kafka


## Installation
npm install .

## Docker Integration
`docker build -t shipping-api .`
`docker run -p 3000:3000 shipping-api`

## API Endpoints
`POST /accounts - Create a new account.`
`GET /payments/{accountId} - Retrieve payment information for a given account.`
`GET /shipments/track/{trackingId} - Track a shipped item.`
`GET /warehouse/{warehouseId}/delivered - Check items delivered to a specified warehouse.`


## Real-Time Analytics
The system is designed to support real-time analytics on customer transactions using Kafka for message queuing and Apache Spark for data processing. This setup enables the integration with existing ERP systems for comprehensive insights into customer behaviors and product performance.

Docker Integration
Docker is used to containerize the API, ensuring consistent environments and easy deployment. The Dockerfile provided in the repository sets up the necessary environment for running the Node.js application.

## Testing
Unit tests are written using Jest. To run the tests, execute:
`npm test`

### Eslint
The project uses ESLint for code linting. To run ESLint, execute:
`npm run lint `
#### to fix code lint
`npx eslint --fix . `



Contributing
Contributions to this project are welcome. Please fork the repository and submit a pull request.
