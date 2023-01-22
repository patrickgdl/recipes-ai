import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center w-full mt-5 border-b-2 pb-5 sm:px-4 px-2">
      <Link href="/" className="flex items-center space-x-3">
        <Image
          alt="header text"
          src="/microwave.png"
          className="sm:w-12 sm:h-12 w-8 h-8"
          width={40}
          height={40}
        />
        <h1 className="text-2xl font-bold ml-2 tracking-tight">
          Gerador de Receitas
        </h1>
      </Link>
    </header>
  );
}
