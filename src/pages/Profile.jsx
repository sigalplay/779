import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getProfile, signOut, isSignedIn } from "@/lib/storage";
import { signOutCloud } from "@/lib/cloud-auth";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isSignedIn()) {
      navigate("/auth");
      return;
    }
    setProfile(getProfile());
  }, [navigate]);

  async function handleSignOut() {
    await signOutCloud();
    signOut();
    toast.success("התנתקת בהצלחה");
    navigate("/");
  }

  if (!profile) return null;

  return (
    <AppShell mode="therapist">
      <h1 className="mb-6 font-display text-3xl font-black">פרופיל</h1>

      <div className="mb-6 rounded-3xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/30 text-2xl">
            {profile.display_name?.[0]?.toUpperCase() ?? "👤"}
          </div>
          <div>
            <div className="font-display text-lg font-bold">{profile.display_name}</div>
            <div className="text-sm text-muted-foreground">
              {profile.email || "משתמש/ת מקומי/ת — הנתונים נשמרים בדפדפן הזה בלבד"}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="mt-5 rounded-full">
          <LogOut className="h-4 w-4" /> התנתקות
        </Button>
      </div>

    </AppShell>
  );
}
