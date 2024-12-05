import Link from "next/link";

const adminSections = [
  { name: "Main", href: "/admin/main" },
  { name: "About", href: "/admin/about" },
  { name: "Plans", href: "/admin/plans" },
];

export default function AdminDashboard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">Admin Panel</h2>
      <nav className="space-y-2">
        {adminSections.map((section) => (
          <Link
            key={section.name}
            href={section.href}
            className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            {section.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
