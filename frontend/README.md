# 🌐 Smart Campus - Frontend Application

This is the React-based client for the **Smart Campus Operations Hub**. It provides an interface for facility bookings, incident reporting, and notification management.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the `frontend` root.
   - Use `.env.example` as a template:
     ```env
     VITE_API_BASE_URL=http://localhost:8080/api
     ```

### Development

Start the development server with Vite:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready bundle:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 🛠️ Built With

- **React 18**
- **Vite** (Build tool)
- **Axios** (API communication)
- **React Router** (Navigation)
- **Vanilla CSS** (Styling)

---

### Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application pages.
- `src/services`: API service logic.
- `src/context`: State management using React Context.
- `src/routes`: Route definitions.
