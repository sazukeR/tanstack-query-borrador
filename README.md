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

# Tanstack query implementacion basica

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

- crear helpers/sleep.ts para poner la aplicacion intencionalmente en estado de loading, esto nos ayudar a saber cuando se esta ejecutando o no la peticion a la api

```
export const sleep = (milliseconds: number) => {
 return new Promise((r) => {
  setTimeout(() => {
   r(true);
  }, milliseconds);
 });
};
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

## llamar un elemento de la peticion para cargarlo individualmente en otra pantalla (no se ejecuta otra peticion http) ejemplo:

```
// hacemos una conexion con el labelNumber, de esta forma nustro custom hook podra realizar la peticion en cada uno de los label components

// dentro del componente que va a realizar la peticion podriamos utilizar funciones del router

const labelItem = () => ....

const navigate = useNavigate()
const params = useParams()
const labelNumber = Number(Params.labelNumber ?? 0)

export const useLabel = ( labelNumber: number ) => {
 const labelQuery = useQuery({
  queryKey: ["labels", labelNumber],
  queryFn: () => getLabel(labelNumber),
  staleTime: 1000 * 60,
 });

 // podriamos generar otros query (relacionados a los labels) dentro de este custom hook, ej:
 // debemos configurar un nuevo archivo api para que maneje los comments

  const commentsQuery = useQuery({
  queryKey: ["labels", labelQuery.data?.number, "comments"],
  queryFn: () => getLabelComments(labelQuery.data!.number),
  staleTime: 1000 * 60,
  // este query depende de el query de arriba, por lo tanto necesitamos que se ejecute solo si el query de arriba lo hace, si enabled esta en false el query no se ejecuta, podemos agregar un boolean condicional a esta propiedad para que cambie de false a true
  enabled: labelQuery.data ==! undefined
 });

 return { labelQuery };
};

```

## podemos hacer una peticion incluso antes de que el usuario haga clic, optimizando nuestra app y dando sensacion de que la aplicacion es mas rapida de lo que ya es ej:

```
const issueItem = ({issue}) => ....
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const prefetchData = () => {
    queryClient.prefetchQuery({
      queryKey: ['issues', issue.number], // este issue viene de un map que pasa la propiedad a cada una de sus elementos
      queryFn: () => getIssue(issue.number),
      staleTime: 1000 * 60,
    });

    <!-- queryClient.prefetchQuery({
      queryKey: ['issues', issue.number, 'comments'],
      queryFn: () => getIssueComments(issue.number),
      staleTime: 1000 * 60,
    });
  }; -->

//RECOMENDADO
// en este item tenemos toda la data que necesitamos para establecer la pantalla de cada issue individual, utilizaremos la data del issue para cargar cada issue individualmente en la pantalla (sin necesidad de disparar otra peticion fetch) ejemplo de uso:

  const presetData = () => {
    queryClient.setQueryData(['issues', issue.number], issue, {
      updatedAt: Date.now() + 1000 * 60, // la data se preestablece cuando el usuario pasa el mouse por encima del issue
    });
  };

     // ejemplo jsx
      <div
      // onMouseEnter={prefetchData}
      onMouseEnter={presetData}.....

       <a
          onClick={() => navigate(`/issues/issue/${issue.number}`)}....
```

## Manejar estados para filtrar los issues abiertos / cerrados / todos

- /issues/views/ListView.tsx (Manejar un estado, en este caso utilizaremos un useState comun pero se podria utilizar un gestor de estados)

```
export const ListView = () => ....
  const [state, setState] = useState<State>(State.All);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { issuesQuery } = useIssues({
    state: state,
  });

  const issues = issuesQuery.data ?? [];

  return
    <div className="grid grid-cols-1 sm:grid-cols-3 mt-5">...
```

- /issues/hooks/useIssues.tsx (actualizaremos el hook que maneja la funcionalidad de la lista de issues para que pueda recibir el estado y añadirlo al key)

```
import { useQuery } from '@tanstack/react-query';
import { getIssues } from '../actions';
import { State } from '../interfaces';


interface Props {
  state: State;
}

export const useIssues = ({ state }: Props) => {

  const issuesQuery = useQuery({
    queryKey: ['issues', { state }], // se recomienda cuando el orden del las keys no es importante como en este caso, enviar el objeto en llaves
    queryFn: () => getIssues(state),
    staleTime: 1000 * 60,
  });

  return {
    issuesQuery,
  };
};
```

- issues/actions/get-issues.action.ts (enviaremos params a la api para filtrar la respuesta)
- NOTA: es importante destacar que se puede realizar este filtrado gracias a que nuestra api esta configurada para recibir params y filtrar la informacion

```
import { githubApi } from '../../api/github.api';
import { sleep } from '../../helpers';
import { GithubIssue, State } from '../interfaces';

export const getIssues = async ( state: State ): Promise<GithubIssue[]> => {
  await sleep(1500);

// obtener params de forma nativa js/ts
  const params = new URLSearchParams();

// añadir state a los params
  if (state !== State.All) {
    params.append('state', state);
  }

  const { data } = await githubApi.get<GithubIssue[]>('/issues', {
    params,
  });

  // console.log(data);

  return data;
};
```

## filtrar issues segun los labels seleccionados

- /issues/views/ListView.tsx, en nuestra vista de lista de labels y issues creamos un nuevo estado que sera un arreglo con los labels seleccionados, estos labels filtraran la lista de issues, tambien enviamos una funcion a la lista de labels para que puedan seleccionarse o deseleccionarse

```
import { useState } from 'react';
import { LoadingSpinner } from '../../shared';
import { IssueList } from '../components/IssueList';
import { LabelPicker } from '../components/LabelPicker';
import { useIssues } from '../hooks';
import { State } from '../interfaces';

export const ListView = () => {
  const [state, setState] = useState<State>(State.All);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { issuesQuery } = useIssues({
    state: state,
    selectedLabels: selectedLabels,
  });

  const issues = issuesQuery.data ?? [];

// esta funcion nor permite manejar el estado de los labels seleccionados
  const onLabelSelected = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 mt-5">
      <div className="col-span-1 sm:col-span-2">
        {issuesQuery.isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <IssueList issues={issues} onStateChange={setState} state={state} />
          </>
        )}
      </div>

      <div className="col-span-1 px-2">
        <LabelPicker
          onLabelSelected={onLabelSelected}
          selectedLabels={selectedLabels}
        />
      </div>
    </div>
  );
};
```

- /issues/components/LabelPicker.tsx, el componente de lista de labels recibirá el estado y la funcion que permite seleccionar y deseleccionar labels y lo distribuira a cada uno de los labels, añadiendo tambien una clase condicional para los estilos

```
import { FC } from 'react';
import { LoadingSpinner } from '../../shared';
import { useLabels } from '../hooks';

interface Props {
  selectedLabels: string[];

  onLabelSelected: (label: string) => void;
}

export const LabelPicker: FC<Props> = ({ selectedLabels, onLabelSelected }) => {
  const { labelsQuery } = useLabels();

  if (labelsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-52">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {labelsQuery.data?.map((label) => (
        <span
          key={label.id}
          onClick={() => onLabelSelected(label.name)}
          className={`animate-fadeIn px-2 py-1 rounded-full text-xs font-semibold hover:bg-slate-800 cursor-pointer text-white
            ${selectedLabels.includes(label.name) ? 'selected-label' : ''}`}
          style={{ border: `1px solid #${label.color}` }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
};
```

- /src/issues/hooks/useIssues.tsx, actualizamos nuestro hook que se encarga de manejar el query, modificaremos el key y la funcion para que ahora pueda recibir el estado de los labels seleccionados

```
import { useQuery } from '@tanstack/react-query';
import { getIssues } from '../actions';
import { State } from '../interfaces';
import { useEffect, useState } from 'react';

interface Props {
  state: State;
  selectedLabels: string[];
}

export const useIssues = ({ state, selectedLabels }: Props) => {

  const issuesQuery = useQuery({
    queryKey: ['issues', { state, selectedLabels, page }],
    queryFn: () => getIssues(state, selectedLabels, page),
    staleTime: 1000 * 60,
  });

  return {
    issuesQuery,
  };
};
```

- /issues/actions/get-issues.action.ts, actualizamos la funcion de nuestro query para que reciba el estado de los labels seleccionados y haga la peticion http

```
import { githubApi } from '../../api/github.api';
import { sleep } from '../../helpers';
import { GithubIssue, State } from '../interfaces';

export const getIssues = async (
  state: State,
  selectedLabels: string[],
): Promise<GithubIssue[]> => {
  await sleep(1500);

  const params = new URLSearchParams();

  if (state !== State.All) {
    params.append('state', state);
  }

// la nuevo funcionalidad que permite filtrar los issues con los labels seleccionados
  if (selectedLabels.length > 0) {
    params.append('labels', selectedLabels.join(','));
  }

  const { data } = await githubApi.get<GithubIssue[]>('/issues', {
    params,
  });

  // console.log(data);

  return data;
};
```

## crear funcion que recibe una fecha en string y retorna hace cuanto tiempo fué

```
export const timeSince = (date: string | Date) => {
  const baseDate = new Date(date);

  const seconds = Math.floor(
    (new Date().getTime() - baseDate.getTime()) / 1000
  );

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
};
```
