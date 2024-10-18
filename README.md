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

1. instalacion / linter / devtools / axios

```
npm i @tanstack/react-query
```

```
npm i -D @tanstack/eslint-plugin-query
```

```
npm i @tanstack/react-query-devtools
```

```
npm install axios
```

2. en el main

```

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>

 <ReactQueryDevtools initialIsOpen={false} />

</QueryClientProvider>
```

3. implementar rapidamente de forma orenada

- crear api/github.api.ts

```
import axios from "axios";

export const githubApi = axios.create({
 baseURL: `https://api.github.com/repos/facebook/react`,
 headers: {
  // api key de github
 },
});
```

- crear un interface para tipar la respuesta de la api interfaces/label.interface.ts

```
export interface GithubLabel {
 id: number;
 node_id: string;
 url: string;
 name: string;
 color: string;
 default: boolean;
 description?: string;
}
```

- crear la accion en el src o en un modulo: actions/get-labels.action.ts

```
import { githubApi } from "../../api/github.api";
import { sleep } from "../../helpers/sleep";
import { GithubLabel } from "../interfaces/label.interface";

export const getLabels = async (): Promise<GithubLabel[]> => {
 await sleep(1500);

 const { data } = await githubApi("/labels");

 // const resp = await fetch(
 //  "https://api.github.com/repos/facebook/react/labels"
 // ).then((res) => res.json());

 // console.log(resp);

 // return resp;

 return data;
};
```

- crear el custon hook que nos ayudara a manejar el estado de nuestra peticion

```
import { useQuery } from "@tanstack/react-query";
import { getLabels } from "../actions/get-labels.action";

export const useLabels = () => {
 const labelsQuery = useQuery({
  queryKey: ["labels"],
  queryFn: getLabels,
  staleTime: 1000 * 60 * 60, // 1 hora donde la peticion se considerara fresca, regresara la misma data en todos los key de labels, sin realizar la peticion nuevamente

  // si sabemos que cierta informacion no cambiara mucho, podemos remplazar nuestro loader por una placeholderData, en este caso copiamos uno de los elementos de data para mostrarlo en pantalla mientras el contenido carga

  // placeholderData: [
  //  {
  //   id: 791921801,
  //   node_id: "MDU6TGFiZWw3OTE5MjE4MDE=",
  //   url: "https://api.github.com/repos/facebook/react/labels/%E2%9D%A4%EF%B8%8F",
  //   name: "❤️",
  //   color: "ffffff",
  //   default: false,
  //  } satisfies GithubLabel,
  // ],

  // en contraste con el placeholderData, el initialData muestra un contenido inicial que perdurara hasta que se haga una nueva peticion con nuevos datos, en este caso la initialData se considera fresca por una hora de stale time

  // initialData: [
  //  {
  //   id: 791921801,
  //   node_id: "MDU6TGFiZWw3OTE5MjE4MDE=",
  //   url: "https://api.github.com/repos/facebook/react/labels/%E2%9D%A4%EF%B8%8F",
  //   name: "❤️",
  //   color: "ffffff",
  //   default: false,
  //  } satisfies GithubLabel,
  // ],
 });

 return { labelsQuery };
};
```

- utilizar el hook y todas sus funcionalidades en tus componentes, ej:

```
 const { labelsQuery } = useLabels();

 if (labelsQuery.isLoading) ......

 labelsQuery.data?.map........
```
