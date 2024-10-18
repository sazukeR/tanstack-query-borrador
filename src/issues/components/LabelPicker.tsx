import { useLabels } from "../hooks/useLabels";

export const LabelPicker = () => {
 const { labelsQuery } = useLabels();

 if (labelsQuery.isLoading) {
  return <div className="flex justify-center items-center h-52">Espere...</div>;
 }

 return (
  <div className="flex flex-wrap gap-2 justify-center">
   {labelsQuery.data?.map((label) => (
    <span
     className="px-2 py-1 rounded-full text-xs font-semibold hover:bg-slate-800 cursor-pointer"
     style={{ border: `1px solid #${label.color}` }}
    >
     {label.name}
    </span>
   ))}
  </div>
 );
};
