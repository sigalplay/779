import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listFavorites, listFolders, createFolder, isSignedIn } from "@/lib/storage";

export default function Favorites() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [favs, setFavs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");

  useEffect(() => {
    if (!isSignedIn()) {
      navigate("/auth");
      return;
    }
    setFavs(listFavorites());
    setFolders(listFolders());
    setReady(true);
  }, [navigate]);

  function addFolder() {
    if (!newFolder.trim()) return;
    createFolder(newFolder.trim());
    setFolders(listFolders());
    setNewFolder("");
    toast.success("תיקייה נוצרה");
  }

  if (!ready) return null;

  return (
    <AppShell mode="therapist">
      <h1 className="mb-2 font-display text-3xl font-black">המועדפים שלי</h1>
      <p className="mb-6 text-muted-foreground">שמור פעילויות לפי תיקיות (גן, בית ספר, אוטיזם...).</p>

      <div className="mb-6 rounded-3xl border border-border/60 bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="me-2 text-sm text-muted-foreground">תיקיות:</span>
          {folders.map((f) => (
            <span key={f.id} className="rounded-full bg-muted px-3 py-1 text-sm">
              {f.name}
            </span>
          ))}
          <div className="ms-auto flex gap-2">
            <Input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="שם תיקייה" className="h-9 w-40" />
            <Button onClick={addFolder} size="sm" variant="outline" className="rounded-full">
              <FolderPlus className="h-4 w-4" /> הוסף
            </Button>
          </div>
        </div>
      </div>

      {favs.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favs.map((f, i) => (f.activity ? <ActivityCard key={f.id} activity={f.activity} index={i} mode="therapist" returnPath="/favorites" returnLabel="חזרה למועדפים" /> : null))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
          עדיין אין מועדפים. גלוש בפעילויות ולחץ על ❤️.
          <div className="mt-4">
            <Link to="/therapist/all" className="text-primary underline">
              לבנק הפעילויות
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
