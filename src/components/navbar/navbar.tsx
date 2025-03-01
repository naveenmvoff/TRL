export default function NavBar({ role }: { role: string }) {
    return (
      <header className="border-b w-full bg-white">
        <div className="flex items-center h-16 px-4">
          <h1 className="text-xl font-bold text-primary">MVP TRACKER</h1>
          <span className="ml-8 text-lg font-bold text-primary">{role.toUpperCase()}</span>
        </div>
      </header>
    );
  }
  