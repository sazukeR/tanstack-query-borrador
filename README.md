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

- crear helpers/sleep.ts para poner la aplicacion intencionalmente en estado de loading, esto nos ayudará a saber cuando se esta ejecutando o no la peticion a la api

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

1. /issues/views/ListView.tsx (Manejar un estado, en este caso utilizaremos un useState comun pero se podria utilizar un gestor de estados)

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

2. /issues/hooks/useIssues.tsx (actualizaremos el hook que maneja la funcionalidad de la lista de issues para que pueda recibir el estado y añadirlo al key)

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

3. issues/actions/get-issues.action.ts (enviaremos params a la api para filtrar la respuesta)

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

1. /issues/views/ListView.tsx, en nuestra vista de lista de labels y issues creamos un nuevo estado que sera un arreglo con los labels seleccionados, estos labels filtraran la lista de issues, tambien enviamos una funcion a la lista de labels para que puedan seleccionarse o deseleccionarse

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

2. /issues/components/LabelPicker.tsx, el componente de lista de labels recibirá el estado y la funcion que permite seleccionar y deseleccionar labels y lo distribuira a cada uno de los labels, añadiendo tambien una clase condicional para los estilos

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

3. /src/issues/hooks/useIssues.tsx, actualizamos nuestro hook que se encarga de manejar el query, modificaremos el key y la funcion para que ahora pueda recibir el estado de los labels seleccionados

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

4. /issues/actions/get-issues.action.ts, actualizamos la funcion de nuestro query para que reciba el estado de los labels seleccionados y haga la peticion http

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

## Paginacion tradicional (enviando params: page)

- get issues, creamos un nuevo argumento para enviar el numero de pagina al params de la api

```
import { githubApi } from '../../api/github.api';
import { sleep } from '../../helpers';
import { GithubIssue, State } from '../interfaces';

export const getIssues = async (
  state: State,
  selectedLabels: string[],
  page: number
): Promise<GithubIssue[]> => {
  await sleep(1500);

  const params = new URLSearchParams();

  if (state !== State.All) {
    params.append('state', state);
  }

  if (selectedLabels.length > 0) {
    params.append('labels', selectedLabels.join(','));
  }

// añadimos params de paginacion
  params.append('page', `${page}`);
  params.append('per_page', '5');

  const { data } = await githubApi.get<GithubIssue[]>('/issues', {
    params,
  });

  // console.log(data);

  return data;
};
```

- /issues/views/ListView.tsx, modificamos el html que contendra los botones abajo del issue list

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

  const { issuesQuery, page, nextPage, prevPage } = useIssues({
    state: state,
    selectedLabels: selectedLabels,
  });

  const issues = issuesQuery.data ?? [];

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

            <div className="flex justify-between items-center">
              <button
                onClick={prevPage}
                className="p-2 bg-blue-500 rounded-md hover:bg-blue-700 transition-all"
              >
                Anteriores
              </button>

              <span>{page}</span>

              <button
                onClick={nextPage}
                className="p-2 bg-blue-500 rounded-md hover:bg-blue-700 transition-all"
              >
                Siguientes
              </button>
            </div>
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

- /issues/hooks/useIssues.tsx ,actualizamos nuestro hook para añadir la funcionalidad de paginado, creamos un state para mantener la pagina actual y funciones para moverse atras y adelante

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
  const [page, setPage] = useState(1);

  const issuesQuery = useQuery({
    queryKey: ['issues', { state, selectedLabels, page }],
    queryFn: () => getIssues(state, selectedLabels, page),
    staleTime: 1000 * 60,
  });

// para retornar a la pagina 1 si el estado de cerrados y abiertos cambia
  useEffect(() => {
    setPage(1);
  }, [state]);

// tambien si los labels seleccionados cambia retornaremos a la pagina 1
  useEffect(() => {
    setPage(1);
  }, [selectedLabels]);

  const nextPage = () => {
    if (issuesQuery.data?.length === 0) {
      return;
    }

    setPage(page + 1);
  };

  const prevPage = () => {
    if (page === 1) {
      return;
    }

    setPage((prevPage) => prevPage - 1);
  };

  return {
    issuesQuery,

    // Getters
    page,

    // Actions
    nextPage,
    prevPage,
  };
};
```

## Paginacion tipo infinite scroll

- /src/issues/views/ListViewInfinite.tsx, el html de nuestro list view para el caso de infinite scroll

```
import { useState } from 'react';
import { LoadingSpinner } from '../../shared';
import { IssueList } from '../components/IssueList';
import { LabelPicker } from '../components/LabelPicker';
import { useIssuesInfinite } from '../hooks';
import { State } from '../interfaces';

export const ListViewInfinite = () => {
  const [state, setState] = useState<State>(State.All);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { issuesQuery } = useIssuesInfinite({
    state: state,
    selectedLabels: selectedLabels,
  });

  // debemos aplanar el arreglo con .flat()
  // [  [issue1, issue2], [issue3, issue4], [issue5, issue6] ]
  // [issue1, issue2, issue3, issue4...]
  const issues = issuesQuery.data?.pages.flat() ?? [];

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
          <div className="flex flex-col justify-center">
            <IssueList issues={issues} onStateChange={setState} state={state} />

           // llamamos fetchNextPage par la siguiente pagina
           // agregamos un loader con isFetchingNextPage

            <button
              onClick={() => issuesQuery.fetchNextPage()}
              disabled={issuesQuery.isFetchingNextPage}
              className="p-2 bg-blue-500 rounded-md hover:bg-blue-700 transition-all disabled:bg-gray-500"
            >
              {issuesQuery.isFetchingNextPage
                ? 'Cargando más..'
                : 'Cargar más...'}
            </button>
          </div>
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

- router, en este ejercicio se crea una ruta para manejar el infine scroll y de esta forma manejar los dos tipos de paginacion en pantallas diferentes "list-infinite"

```
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GitApp } from '../GitApp';

import { ListView, IssueView, ListViewInfinite } from '../issues/views';

export const router = createBrowserRouter([
  {
    path: '/issues',
    element: <GitApp />,
    children: [
      { path: 'list', element: <ListView /> },
      //nueva ruta para ListViewInfinite
      { path: 'list-infinite', element: <ListViewInfinite /> },
      { path: 'issue/:issueNumber', element: <IssueView /> },
      { path: '*', element: <Navigate to="list" /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="issues/list" />,
  },
  {
    path: '*',
    element: <h1>Not found</h1>,
  },
]);
```

- useIssuesInfinite, creamos un hook copia de useIssue y cambiamos de useQuery a un hook que ofrece react para initescroll "useInfiniteQuery" para manejar la paginacion estilo infinite scrooll (en este ejercicio se aplico un boton para realizar la peticion, pero se puede utilizar el window para establecer que cuando el scrroll llegue a cierto punto de la pantalla se realice la peticion)

```
import { useInfiniteQuery } from '@tanstack/react-query';
import { getIssues } from '../actions';
import { State } from '../interfaces';

interface Props {
  state: State;
  selectedLabels: string[];
}

// en lugar de usar useQuery, importaremos useInfiniteQuery,
// agregamos "infinite" al query key, solo para no confundirnos con el listado de issues del ejercicio anterios
// en nuestro query key en la 3ra posicion tenemos las propiedades que necesitamos para la query function (desestructuramos ese 3er argumento)
//
//
// agregamos al objeto de configuracion el nextpageparam y initialpageparam para realizar el paginado automatico

export const useIssuesInfinite = ({ state, selectedLabels }: Props) => {
  const issuesQuery = useInfiniteQuery({
    queryKey: ['issues', 'infinite', { state, selectedLabels }],
    queryFn: ({ pageParam, queryKey }) => {
      const [, , args] = queryKey;
      const { state, selectedLabels } = args as Props;

      return getIssues(state, selectedLabels, pageParam);
    },
    staleTime: 1000 * 60,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length > 0 ? pages.length + 1 : undefined,

    // [  [issue1, issue2], [issue3, issue4], [issue5, issue6] ]
  });

  return {
    issuesQuery,
  };
};
```

## react hook form

- /products/pages/NewProduct.tsx, react hook form para manejo del formulario para posteos, (utilizamos Controler en lugar de usar la funcion register en casos donde se esta trabajando con inputs que vienen de una libreria de diseño, como nextui en este ejemplo)

```
import { Button, Image, Input, Textarea } from "@nextui-org/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useProductMutation } from "..";

interface FormInputs {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export const NewProduct = () => {

  const productMutation = useProductMutation();
  // const productMutation = useMutation({
  //   mutationFn: productActions.createProduct,
  //   onSuccess: () => {
  //     console.log('Producto creado');
  //   }
  // });

  // establecemos cierta informacion por defecto

  const { control, handleSubmit, watch } = useForm<FormInputs>({
    defaultValues: {
      title: "Teclado",
      price: 150.22,
      description: "Fugiat culpa esse eiusmod sint ullamco pariatur voluptate dolor ea sint duis fugiat veniam. Mollit ut nisi nulla sunt duis nulla irure magna cupidatat. Ex aliqua occaecat ipsum magna ipsum quis magna in. Nostrud magna proident veniam occaecat Lorem mollit irure amet sit. Tempor dolore elit culpa tempor occaecat culpa eu incididunt non. Ipsum consequat do sit ipsum proident est velit nisi eu occaecat laborum fugiat dolore. Mollit commodo ea cupidatat consequat cillum amet veniam consequat.",
      category: "men's clothing",
      image: "https://www.officedepot.com.gt/medias/38615.jpg-1200ftw?context=bWFzdGVyfHJvb3R8Mzg4MzA1fGltYWdlL2pwZWd8aDI5L2g1ZS8xMDEzNTM0MzIwMjMzNC8zODYxNS5qcGdfMTIwMGZ0d3w3ZDE3ZGI0NGZlYjhlMDk4NDJjZjdjZjNhZWFlMDA4ODE1MDA2ZTMxZjAwODVjZmZjODBlYzBlNDBmMGUwM2Ix"
    }
  });

  // utilizar la funcion watch nos permitira lanzar un efecto cada vez que el campo image cambia

  const newImage = watch('image');


  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    productMutation.mutate(data);
  }


  return (
    <div className="w-full flex-col">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)} >

        <div className="flex justify-around items-center">

          <div className="flex-col w-[500px]">

            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value} onChange={field.onChange} className="mt-2" type="text" label="Titulo del producto" />
              )}
            />

            // cuando usamos el Controler para manejar nuestro input, no podemos convertir el valor automaticamente a formato number, asi que enviamos el campo como un numero al onChange, de la siguiente manera:

            <Controller
              control={control}
              name="price"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value.toString()} onChange={ ev => field.onChange( +ev.target.value )} className="mt-2" type="number" label="Precio" />
                )}
            />

            <Controller
              control={control}
              name="image"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value} onChange={field.onChange} className="mt-2" type="url" label="Url de la imagen del producto" />
              )}
            />

            <Controller
              control={control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => (
                <Textarea value={field.value} onChange={field.onChange} className="mt-2" label="Descripcion del producto" />
              )}
            />

            <Controller
              control={control}
              name="category"
              rules={{ required: true }}
              render={({ field }) => (
                <select value={field.value} onChange={field.onChange} className="rounded-md p-3 mt-2 bg-gray-800 w-full">
                  <option value="men's clothing">Men's clothing</option>
                  <option value="women's clothing">Women's clothing</option>
                  <option value="jewelery">Jewelery</option>
                  <option value="electronics">Electronics</option>
                </select>
              )}
            />




            <br />
            <Button
              type="submit"
              className="mt-2"
              isDisabled={ productMutation.isLoading }
              color="primary">
                { productMutation.isLoading ? 'Cargando...' : 'Crear producto' }
              </Button>
          </div>

          <div className="bg-white rounded-2xl p-10 flex items-center" style={{
            width: '500px',
            height: '600px',
          }}>

            <Image
              src={ newImage }
            />
          </div>

        </div>


      </form>

    </div>
  )
}
```

## Mutaciones

1. /actions.ts, creamos la funcion que llamara el useMutation para hacer un post

```
import { type Product, productsApi } from "..";


interface GetProductsOptions {
  filterKey?: string;
}


export const sleep = ( seconds: number ):Promise<boolean> => {
  return new Promise( resolve => {
    setTimeout( () => {
      resolve( true );
    }, seconds * 1000 );
  });
}


export const getProducts = async({ filterKey }:GetProductsOptions):Promise<Product[]> => {

  // await sleep(2);

  const filterUrl = ( filterKey ) ? `category=${filterKey}` : ''

  const { data } = await productsApi.get<Product[]>(`/products?${ filterUrl }`);
  return data;
}


export const getProductById = async(id: number):Promise<Product> => {

  // await sleep(2);

  const { data } = await productsApi.get<Product>(`/products/${ id }`);
  return data;
}


export interface ProductLike {
  id?:         number;
  title:       string;
  price:       number;
  description: string;
  category:    string;
  image:       string;
}
export const createProduct = async( product: ProductLike ) => {
  await sleep(5);

  // throw new Error('Error creando un producto');

  const { data } = await productsApi.post<Product>(`/products`, product );
  return data;
}
```

2. useProductMutation.tsx, creamos un hook personalizado para envolver nuestro useMutation, al realizar la mutacion podemos actualizar la informacion de los productos de dos formas:
   - invalidando queries: de esta forma se realiza nuevamente la peticion http ya que los datos en cache son considerado obsoletos
   - insertar data directamente

```
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, productActions } from "..";

export const useProductMutation = () => {

 // utilizaremos el queryClient para invalidar queries

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: productActions.createProduct,


    onSuccess: (product, variables, context ) => {
      console.log(product);

      <!-- utilizaremos invalidacion de query, de esta forma, cuando un usuario postee un producto, este aparecera reflejado en la lista al volver a esa pantalla, ya que se realiza nuevamente la peticion http, mostrando la lista con el nuevo producto -->

      // queryClient.invalidateQueries(
      //   ['products',{ filterKey: data.category }]
      // );


        // utilizamos el queryClient para establecer la data de este nuevo producto, en nuestra lista de productos, se necesita el key de la query que requerimos actualizar y una funcion para establecer la data antigua con la nueva

      queryClient.setQueryData<Product[]>(
        ['products',{ filterKey: product.category }],
        (old) => {
          if ( !old ) return [product];

          return [...old, product]
        }
      );

    },

  });


  return mutation;
}
```

3. NewProduct.tsx, usamos nuestro hook en el componente para realizar un post

```
import { Button, Image, Input, Textarea } from "@nextui-org/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useProductMutation } from "..";

interface FormInputs {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}


export const NewProduct = () => {

  const productMutation = useProductMutation();
  // const productMutation = useMutation({
  //   mutationFn: productActions.createProduct,
  //   onSuccess: () => {
  //     console.log('Producto creado');
  //   }
  // });

  const { control, handleSubmit, watch } = useForm<FormInputs>({
    defaultValues: {
      title: "Teclado",
      price: 150.22,
      description: "Fugiat culpa esse eiusmod sint ullamco pariatur voluptate dolor ea sint duis fugiat veniam. Mollit ut nisi nulla sunt duis nulla irure magna cupidatat. Ex aliqua occaecat ipsum magna ipsum quis magna in. Nostrud magna proident veniam occaecat Lorem mollit irure amet sit. Tempor dolore elit culpa tempor occaecat culpa eu incididunt non. Ipsum consequat do sit ipsum proident est velit nisi eu occaecat laborum fugiat dolore. Mollit commodo ea cupidatat consequat cillum amet veniam consequat.",
      category: "men's clothing",
      image: "https://www.officedepot.com.gt/medias/38615.jpg-1200ftw?context=bWFzdGVyfHJvb3R8Mzg4MzA1fGltYWdlL2pwZWd8aDI5L2g1ZS8xMDEzNTM0MzIwMjMzNC8zODYxNS5qcGdfMTIwMGZ0d3w3ZDE3ZGI0NGZlYjhlMDk4NDJjZjdjZjNhZWFlMDA4ODE1MDA2ZTMxZjAwODVjZmZjODBlYzBlNDBmMGUwM2Ix"
    }
  });

  const newImage = watch('image');


  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    productMutation.mutate(data);
  }


  return (
    <div className="w-full flex-col">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)} >

        <div className="flex justify-around items-center">

          <div className="flex-col w-[500px]">

            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value} onChange={field.onChange} className="mt-2" type="text" label="Titulo del producto" />
              )}
            />

            <Controller
              control={control}
              name="price"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value.toString()} onChange={ ev => field.onChange( +ev.target.value )} className="mt-2" type="number" label="Precio" />
                )}
            />

            <Controller
              control={control}
              name="image"
              rules={{ required: true }}
              render={({ field }) => (
                <Input value={field.value} onChange={field.onChange} className="mt-2" type="url" label="Url de la imagen del producto" />
              )}
            />

            <Controller
              control={control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => (
                <Textarea value={field.value} onChange={field.onChange} className="mt-2" label="Descripcion del producto" />
              )}
            />

            <Controller
              control={control}
              name="category"
              rules={{ required: true }}
              render={({ field }) => (
                <select value={field.value} onChange={field.onChange} className="rounded-md p-3 mt-2 bg-gray-800 w-full">
                  <option value="men's clothing">Men's clothing</option>
                  <option value="women's clothing">Women's clothing</option>
                  <option value="jewelery">Jewelery</option>
                  <option value="electronics">Electronics</option>
                </select>
              )}
            />

            <br />
            <Button
              type="submit"
              className="mt-2"
              isDisabled={ productMutation.isLoading }
              color="primary">
                { productMutation.isLoading ? 'Cargando...' : 'Crear producto' }
              </Button>
          </div>

          <div className="bg-white rounded-2xl p-10 flex items-center" style={{
            width: '500px',
            height: '600px',
          }}>

            <Image
              src={ newImage }
            />
          </div>

        </div>
      </form>
    </div>
  )
}
```

## Actualizaciones optimistas

1. llamar onMutate con la data que estamos recibiendo de nuestra funcion createProduct, creamos el producto con un id aleatorio que luego sera reemplazado con el id real del producto.
2. afectar mi queryClient cache, actualizandolo con el producto optimista.
3. si tuvimos exito en la insercion del producto en onSuccess
4. si la insercion del producto optimista falla, debemos revertir la operacion

```
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, productActions } from "..";

export const useProductMutation = () => {

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: productActions.createProduct,

    onMutate: (product) => {
      console.log('Mutando - Optimistic update');

      // Optimistic Product
      const optimisticProduct = { id: Math.random(), ...product };
      console.log({ optimisticProduct });

      // Almacenar el producto en el cache del query client
      queryClient.setQueryData<Product[]>(
        ['products',{ filterKey: product.category }],
        (old) => {
          if ( !old ) return [optimisticProduct];

          return [...old, optimisticProduct];
        });

// retornamos lo que seria el contexto del onSuccess
      return {
        optimisticProduct
      };

    },

 // tendremos 3 argumentos:
 // 1. el producto como tan, resultado de la promesa
 // 2. las variables, es decir el objeto original (lo que le enviamos a la promesa)
 // el contexto: la informacion que nos regresara el onMutate (nuestro producto optimista)

    onSuccess: (product, variables, context ) => {
      console.log({ product, variables, context });

      // queryClient.invalidateQueries(
      //   ['products',{ filterKey: data.category }]
      // );

      // en este punto, nuestra lista de productos ya va a tener insertado el productoOptimista

      // debemos buscar el producto optimista y cambiarlo por el producto que se a agregado en la base de datos


        // opcional: removemos nuestro query key del producto optiomista
      queryClient.removeQueries(
        ["product", context?.optimisticProduct.id ]
      );

      queryClient.setQueryData<Product[]>(
        ['products',{ filterKey: product.category }],
        (old) => {
          if ( !old ) return [product];


          return old.map( cacheProduct => {
            return cacheProduct.id === context?.optimisticProduct.id ? product : cacheProduct;
          })
        }
      );

    },

    // en caso de que la insersion de nuestro producto falla

    onError: (error, variables, context ) => {
      console.log({ error, variables, context });

      queryClient.removeQueries(
        ["product", context?.optimisticProduct.id ]
      );

      queryClient.setQueryData<Product[]>(
        ['products',{ filterKey: variables.category }],
        (old) => {
          if ( !old ) return [];

          return old.filter( cacheProduct => {
            return cacheProduct.id !== context?.optimisticProduct.id
          });
        }
      );

    }

  });

  return mutation;
}
```
