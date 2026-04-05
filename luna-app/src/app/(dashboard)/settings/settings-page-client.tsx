"use client";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportSection } from "@/components/settings/ExportReminder";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@/hooks/useUser";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export function SettingsPageClient() {
  const queryClient = useQueryClient();
  const { setTheme, theme: activeTheme } = useTheme();
  const { data, isLoading, saveProfile, isSaving } = useUser();
  const { supported: pushOk, subscribePush } = useNotifications();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [avg, setAvg] = useState(28);
  const [luteal, setLuteal] = useState(14);
  const [dur, setDur] = useState(5);
  const [mode, setMode] = useState<"ttc" | "avoid">("avoid");
  const [notifOn, setNotifOn] = useState(true);
  const [themePref, setThemePref] = useState<"light" | "dark" | "system">("light");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkDeleteToastRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (bulkDeleteTimerRef.current) {
        clearTimeout(bulkDeleteTimerRef.current);
        bulkDeleteTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!data?.user) return;
    const u = data.user;
    setName(u.name ?? "");
    if (u.dateOfBirth) {
      const d = parse(u.dateOfBirth.slice(0, 10), "yyyy-MM-dd", new Date());
      setDateOfBirth(Number.isNaN(d.getTime()) ? null : d);
    } else {
      setDateOfBirth(null);
    }
    setAvg(u.averageCycleLen);
    setLuteal(u.lutealPhaseLen);
    setDur(u.periodDuration);
    setMode(u.mode);
    setNotifOn(u.notificationsOn);
    const t =
      u.theme === "dark" || u.theme === "light" || u.theme === "system"
        ? u.theme
        : "light";
    setThemePref(t);
    if (t === "light" || t === "dark" || t === "system") {
      setTheme(t);
    }
  }, [data?.user, setTheme]);

  async function saveBasics() {
    try {
      await saveProfile({
        name: name.trim() || null,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
        averageCycleLen: avg,
        lutealPhaseLen: luteal,
        periodDuration: dur,
        mode,
        notificationsOn: notifOn,
        theme: themePref,
      });
      if (themePref === "light" || themePref === "dark" || themePref === "system") {
        setTheme(themePref);
      }
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function deleteAllLogs() {
    try {
      const res = await fetch("/api/user/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE_MY_DATA" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? "Delete failed");
      }
      setDeleteConfirm("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.periods });
      void queryClient.invalidateQueries({ queryKey: queryKeys.symptoms });
      void queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
      void queryClient.invalidateQueries({ queryKey: queryKeys.insights });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success("Period and symptom logs removed from this account.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function scheduleDeleteAllLogs() {
    if (bulkDeleteTimerRef.current) {
      clearTimeout(bulkDeleteTimerRef.current);
      bulkDeleteTimerRef.current = null;
    }
    if (bulkDeleteToastRef.current != null) {
      toast.dismiss(bulkDeleteToastRef.current);
    }
    const tid = toast.message("Deleting all logs in 5 seconds…", {
      description: "Tap Undo if you changed your mind.",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          if (bulkDeleteTimerRef.current) {
            clearTimeout(bulkDeleteTimerRef.current);
            bulkDeleteTimerRef.current = null;
          }
          toast.dismiss(tid);
          toast.message("Deletion cancelled");
        },
      },
    });
    bulkDeleteToastRef.current = tid;
    bulkDeleteTimerRef.current = setTimeout(() => {
      bulkDeleteTimerRef.current = null;
      bulkDeleteToastRef.current = undefined;
      void deleteAllLogs();
    }, 5000);
  }

  async function onEnablePush() {
    try {
      await subscribePush();
      toast.success("Push subscription saved for this device.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not enable push");
    }
  }

  if (isLoading || !data?.user) {
    return (
      <div
        className="mx-auto max-w-xl space-y-8"
        aria-busy="true"
        aria-label="Loading settings"
      >
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const u = data.user;
  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim());

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Profile, cycle assumptions, appearance, exports, and data controls.
        </p>
      </header>

      <MedicalDisclaimer className="text-xs text-muted-foreground" />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown in Luna and used for your account label.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={u.email ?? ""} disabled readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <p className="text-xs text-muted-foreground">
              Optional. Used only in your profile; you can clear it anytime.
            </p>
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 size-4 opacity-70" aria-hidden />
                {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth ?? undefined}
                  onSelect={(d) => setDateOfBirth(d ?? null)}
                  defaultMonth={dateOfBirth ?? new Date(1995, 0)}
                  captionLayout="dropdown"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
            {dateOfBirth ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={() => setDateOfBirth(null)}
              >
                Clear date of birth
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cycle defaults</CardTitle>
          <CardDescription>
            Used when forecasting before enough cycles are logged. Values still respect your
            logged periods.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="avg">Avg cycle (days)</Label>
            <Input
              id="avg"
              type="number"
              min={21}
              max={45}
              value={avg}
              onChange={(e) => setAvg(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="luteal">Luteal phase (days)</Label>
            <Input
              id="luteal"
              type="number"
              min={10}
              max={20}
              value={luteal}
              onChange={(e) => setLuteal(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dur">Typical bleed (days)</Label>
            <Input
              id="dur"
              type="number"
              min={2}
              max={12}
              value={dur}
              onChange={(e) => setDur(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals &amp; notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tracking mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "ttc" | "avoid")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avoid">Avoid pregnancy</SelectItem>
                <SelectItem value="ttc">Trying to conceive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium">In-app / local reminders</p>
              <p className="text-xs text-muted-foreground">
                Toggle prediction toasts and similar UI nudges.
              </p>
            </div>
            <Switch checked={notifOn} onCheckedChange={setNotifOn} />
          </div>
          <div className="space-y-2 rounded-lg border border-border/60 p-3">
            <p className="text-sm font-medium">Web push (optional)</p>
            <p className="text-xs text-muted-foreground">
              {vapidConfigured
                ? "Turn on to get reminders on this device when your browser allows it."
                : "Push notifications are not set up for this app yet. You can still use in-app reminders above."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!pushOk || !vapidConfigured}
              onClick={() => void onEnablePush()}
            >
              Enable push on this device
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Synced to your account. Current UI: {activeTheme ?? "…"}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="mb-2 block">Theme</Label>
          <Select
            value={themePref}
            onValueChange={(v) => setThemePref(v as "light" | "dark" | "system")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button type="button" onClick={() => void saveBasics()} disabled={isSaving} className="w-full">
        {isSaving ? "Saving…" : "Save changes"}
      </Button>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Download copies of your data. Exports include logged cycles and symptoms.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportSection />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete logged data</CardTitle>
          <CardDescription>
            Removes all period and symptom logs. Your login and these settings stay intact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <AlertDialogTrigger
              render={<Button variant="destructive">Delete all logs…</Button>}
            />
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete period &amp; symptom logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will have a few seconds to undo after you confirm. Type{" "}
                  <span className="font-mono text-foreground">DELETE_MY_DATA</span> below to
                  continue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE_MY_DATA"
                autoComplete="off"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={deleteConfirm !== "DELETE_MY_DATA"}
                  onClick={() => {
                    setBulkDeleteOpen(false);
                    const c = deleteConfirm;
                    setDeleteConfirm("");
                    if (c === "DELETE_MY_DATA") {
                      scheduleDeleteAllLogs();
                    }
                  }}
                >
                  Delete logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
