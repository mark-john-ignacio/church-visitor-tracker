# Getting Started

Welcome to the MyXFin development documentation! This guide will help you understand our Laravel + Inertia.js + React application.

## Overview

MyXFin is a financial management system built with:

- **Backend**: Laravel 10 with Inertia.js
- **Frontend**: React with TypeScript
- **UI**: shadcn/ui components
- **Database**: MySQL/PostgreSQL
- **State Management**: Inertia.js (no separate API)

## Architecture

```mermaid
graph LR
    A[React Components] --> B[Inertia.js]
    B --> C[Laravel Routes]
    C --> D[Controllers]
    D --> E[Models]
    E --> F[Database]
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

## Key Concepts

### 1. **No API Layer**

Unlike traditional SPAs, we don't have REST/GraphQL APIs. Inertia.js handles communication between React frontend and Laravel backend.

### 2. **Server-Side Rendering**

Pages are server-rendered with data, then hydrated on the client. This gives us the best of both worlds.

### 3. **Consistent Patterns**

Every module follows the same patterns:

- **Models**: Business logic and database interactions
- **Controllers**: Handle requests and return Inertia responses
- **Components**: Reusable React components
- **Pages**: Route-specific React components

## Documentation Structure

- **Frontend** - React components, pages, and patterns
- **Backend** - Laravel models, controllers, and patterns
- **Architecture** - System design and data flow
- **[Components Demo](http://localhost:6006)** - Interactive component playground

## Quick Start

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd myxfin
    ```

2. **Install dependencies**

    ```bash
    composer install
    npm install
    ```

3. **Setup environment**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Run development servers**

    ```bash
    # Terminal 1: Laravel
    php artisan serve

    # Terminal 2: Vite
    npm run dev

    # Terminal 3: Documentation
    npm run docs:dev

    # Terminal 4: Storybook
    npm run storybook
    ```
