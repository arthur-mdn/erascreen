# Étape de construction
FROM node:latest as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Étape d'exécution
FROM node:latest
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]

