// app/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="mt-4">You don't have permission to view this page</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}