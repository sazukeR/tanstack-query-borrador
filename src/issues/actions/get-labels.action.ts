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
