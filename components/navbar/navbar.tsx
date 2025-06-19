import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 shadow">
      <div className="container mx-auto flex items-center justify-between">
        <div className="space-x-4">
          <Link href="/" className="text-gray-700 hover:text-black">
            {{page1_component1_text1}}
          </Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-black">
            Dashboard
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-black">
            Login
          </Link>
          <Link href="/signup" className="text-gray-700 hover:text-black">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
