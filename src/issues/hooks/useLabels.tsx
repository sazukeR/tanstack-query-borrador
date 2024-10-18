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
