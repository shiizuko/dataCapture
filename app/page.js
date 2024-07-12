import Signup from "./pages/Signup";
import SyncStatusPage from "./pages/SyncStatusPage";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <Signup/>
    <SyncStatusPage />
    </main>
  );
}
