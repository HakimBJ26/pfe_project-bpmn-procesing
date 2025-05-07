# BPMN Process Manager

A modern frontend application for modeling, managing, and executing business process workflows with BPMN, DMN, and form capabilities.

## Features

- **BPMN Modeling**: Create and edit Business Process Model and Notation (BPMN) diagrams
- **DMN Modeling**: Build and manage Decision Model and Notation (DMN) tables
- **Form Builder**: Create and customize forms for user tasks
- **Workflow Management**: Design, deploy, and track workflows
- **Task Management**: View and complete user tasks
- **Authentication**: Secure login and session management

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: React Router 7
- **State Management**: Zustand
- **UI Components**: 
  - Shadcn/UI (Radix UI)
  - Tailwind CSS
  - Lucide React icons
- **API Communication**: Axios, TanStack Query
- **Modeling Tools**:
  - bpmn-js
  - dmn-js
  - form-js
- **Form Validation**: Zod, React Hook Form
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- pnpm 9.15.4 or later

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd [project-directory]
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   VITE_API_URL=http://your-backend-url
   ```

### Development

Start the development server:
```
pnpm dev
```

The application will be available at http://localhost:5173

### Building for Production

```
pnpm build
```

The build output will be in the `dist` directory.

## Project Structure

- `src/`: Source code
  - `assets/`: Static assets
  - `components/`: Reusable UI components
  - `hooks/`: React hooks
  - `lib/`: Utility functions and configurations
  - `services/`: API service functions
  - `stores/`: Zustand state stores
  - `types/`: TypeScript type definitions
  - `views/`: Main application views/pages
    - `bpmn-modeler/`: BPMN diagram editor
    - `dmn-builder/`: DMN table builder
    - `form-builder/`: Form designer
    - `process/`: Process management
    - `task/`: Task handling
    - `workflow-builder/`: Workflow creation and editing

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
