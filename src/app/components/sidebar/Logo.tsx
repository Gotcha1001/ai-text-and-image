import Link from "next/link";
import { RiSparkling2Fill } from "react-icons/ri";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-cyan-500">
        <RiSparkling2Fill className="size-5 text-white" />
      </div>
      <span className="bg-linear-to-r from-violet-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
        NEXTGPT
      </span>
    </Link>
  );
}
