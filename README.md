# GitHub Issues - TanStack Query

Repositorio del proyecto del curso sobre TanStack Query con React

## Dev

1. Clonar repositorio

```
git clone https://github.com/sazukeR/tanstack-query-borrador.git
```

2. Instalar dependencias

```
npm install
```

3. Iniciar servidor de desarrollo

```
npm run dev
```

## Tecnologías usadas

- React
- TanStack Query
- TailwindCSS
- React Router 6+
- React Icons

# Tanstack query implementacion

1. instalacion / linter / devtools

```
npm i @tanstack/react-query
```

```
npm i -D @tanstack/eslint-plugin-query
```

```
npm i @tanstack/react-query-devtools
```

2. en el main

```

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>

 <ReactQueryDevtools initialIsOpen={false} />

</QueryClientProvider>
```
