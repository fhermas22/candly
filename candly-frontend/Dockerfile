# ─────────────────────────────────────────────────────────
# Dockerfile for Candly Frontend (React 19 + Vite 8)
# ─────────────────────────────────────────────────────────

# Step 1 : Base Image
FROM node:20-alpine AS development

# Step 2 : Working directory in the container
WORKDIR /app

# Step 3 : Copy the dependency files FIRST (cache optimization)
COPY package.json package-lock.json ./

# Install the Node.js dependencies
RUN npm ci

# Step 4 : Copy the rest of the source code
COPY . .

# Step 5 : Document the development port for Vite
EXPOSE 5173

# Step 6 : Start the development server for Vite
CMD ["npm", "run", "dev", "--", "--host"]