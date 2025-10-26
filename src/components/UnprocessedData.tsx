import { FaRegSadTear } from "react-icons/fa"

export const UnprocessedData = () => {
  return (
    <span className="flex items-center gap-2 text-xl mt-5">
      <FaRegSadTear /> Seus dados ainda não foram processados, isso pode levar até 1 hora
    </span>
  );
}