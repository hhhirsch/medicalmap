import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">
        Medical Congress Directory
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mb-8">
        Discover, filter, and export medical congresses worldwide.
        Find the right events for your therapeutic area, region, and schedule.
      </p>
      <Link
        href="/congresses"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Browse Congresses →
      </Link>
    </div>
  );
}
