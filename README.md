# TotoSitter Dashboard

Dashboard web em Next.js para o dispositivo TotoSitter. Lê os dados em
tempo real do Firebase Realtime Database (mesmos caminhos que o firmware
escreve: `/totositter/state` e `/totositter/events`).

## Dev

```bash
cp .env.local.example .env.local   # ajuste a URL do RTDB se precisar
npm install
npm run dev
```

Abra <http://localhost:3000>.

## Build local com Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://totositter-9be96-default-rtdb.firebaseio.com \
  -t totositter-dashboard .

docker run --rm -p 3000:3000 totositter-dashboard
```

## docker compose

```bash
docker compose up --build       # build + run em foreground
docker compose up -d --build    # em background
docker compose down             # parar
```

As `NEXT_PUBLIC_FIREBASE_*` podem vir de um `.env` ao lado do
`docker-compose.yml` (a URL do RTDB já tem default).
