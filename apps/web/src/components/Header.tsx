import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          🏥 MedicalMap
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/congresses" className="text-gray-600 hover:text-gray-900">
            Directory
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
            Privacy
          </Link>
          <Link href="/imprint" className="text-gray-600 hover:text-gray-900">
            Imprint
          </Link>
        </nav>
      </div>
    </header>
  );
}
