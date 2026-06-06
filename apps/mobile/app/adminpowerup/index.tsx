/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

// NOTE: Client-side password gate. This is a low-trust web-only barrier — the
// real authorization must be enforced server-side on every admin endpoint.
// The variable is intentionally non-EXPO_PUBLIC: it is read at runtime on web
// where `process.env` is substituted at build time, and is required to be
// supplied via the build environment. Missing config throws immediately so the
// app never silently falls back to an empty/default password.
const getAdminPassword = (): string => {
  const value = process.env.ADMIN_PANEL_PASSWORD || process.env.EXPO_PUBLIC_ADMIN_PASSWORD;
  if (!value) {
    throw new Error("ADMIN_PANEL_PASSWORD is not configured. Set it in the build environment.");
  }
  return value;
};
const SESSION_KEY = "powerup.adminpowerup.session";
// Strip trailing /api suffix so we can prepend /api/v1 ourselves.
const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
const API_URL = `${API_BASE}/api/v1`;

interface ContentVersion {
  id: string;
  module_id: string;
  cefr_band: string;
  day_number: number;
  version: number;
  is_active: boolean;
  blob_url: string;
  scenario_title: string;
  generated_at: string;
}

/**
 * Web-only internal admin panel.
 * - On native (iOS/Android) it short-circuits to a "web only" notice.
 * - Auth is a single hardcoded password from EXPO_PUBLIC_ADMIN_PASSWORD.
 * - Session lives in localStorage; mobile bundle never renders this route.
 */
export default function AdminPowerupPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      if (window.localStorage.getItem(SESSION_KEY) === "1") {
        setAuthed(true);
      }
    }
  }, []);

  if (Platform.OS !== "web") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 16, color: "#475569", textAlign: "center" }}>
          The admin panel is only available on the web build.
        </Text>
      </View>
    );
  }
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD || process.env.EXPO_PUBLIC_ADMIN_PASSWORD;
  if (!adminPassword) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View
          style={{
            width: 400,
            maxWidth: "100%",
            backgroundColor: "#fff7ed",
            borderWidth: 1,
            borderColor: "#fed7aa",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#9a3412", marginBottom: 8 }}>
            Admin panel not configured
          </Text>
          <Text style={{ fontSize: 14, color: "#7c2d12", lineHeight: 22 }}>
            <Text style={{ fontFamily: "monospace" }}>EXPO_PUBLIC_ADMIN_PANEL_PASSWORD</Text> is not
            set in your environment.{"\n\n"}Add it to{" "}
            <Text style={{ fontFamily: "monospace" }}>apps/mobile/.env</Text> and restart the dev
            server with <Text style={{ fontFamily: "monospace" }}>pnpm start:clean</Text>.
          </Text>
        </View>
      </View>
    );
  }

  const onLogin = () => {
    try {
      if (pw === getAdminPassword()) {
        if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(SESSION_KEY, "1");
        }
        setAuthed(true);
        setError(null);
      } else {
        setError("Incorrect password.");
      }
    } catch (e: any) {
      setError(e.message || "Configuration error.");
    }
  };

  const onLogout = () => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(SESSION_KEY);
    }
    setAuthed(false);
    setPw("");
  };

  if (!authed) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ width: 360, maxWidth: "100%" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 16 }}>PowerUp Admin</Text>
          <TextInput
            placeholder="Password"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
            }}
          />
          {error ? <Text style={{ color: "#dc2626", marginTop: 8 }}>{error}</Text> : null}
          <Pressable
            onPress={onLogin}
            style={{
              marginTop: 16,
              backgroundColor: "#0f172a",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <AdminDashboard onLogout={onLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/content/versions`, {
        headers: { "X-Admin-Password": getAdminPassword() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ContentVersion[] = await res.json();
      setVersions(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const activate = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`${API_URL}/admin/content/versions/${id}/activate`, {
        method: "POST",
        headers: { "X-Admin-Password": getAdminPassword() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchVersions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to activate");
    } finally {
      setBusy(null);
    }
  };

  const grouped = useMemo(() => {
    const m = new Map<string, ContentVersion[]>();
    for (const v of versions) {
      const key = `${v.module_id}|${v.cefr_band}|${v.day_number}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)?.push(v);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [versions]);

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
        <Text style={{ flex: 1, fontSize: 28, fontWeight: "800" }}>Content versions</Text>
        <Pressable onPress={fetchVersions} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: "#2563eb", fontWeight: "600" }}>Refresh</Text>
        </Pressable>
        <Pressable onPress={onLogout} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: "#64748b", fontWeight: "600" }}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? <Text>Loading…</Text> : null}
      {error ? <Text style={{ color: "#dc2626", marginBottom: 16 }}>{error}</Text> : null}

      {grouped.map(([key, group]) => {
        const [moduleId = "", cefr = "", day = ""] = key.split("|");
        return (
          <View
            key={key}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              Module {moduleId.slice(0, 8)}… · {cefr} · Day {day}
            </Text>
            {group
              .sort((a, b) => b.version - a.version)
              .map((v) => (
                <View
                  key={v.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#f1f5f9",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600" }}>
                      v{v.version} {v.is_active ? "· active" : ""}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 12 }}>{v.scenario_title}</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 11 }}>
                      {new Date(v.generated_at).toLocaleString()}
                    </Text>
                  </View>
                  {v.is_active ? null : (
                    <Pressable
                      onPress={() => activate(v.id)}
                      disabled={busy === v.id}
                      style={{
                        backgroundColor: busy === v.id ? "#cbd5e1" : "#0f172a",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        {busy === v.id ? "Activating…" : "Activate"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
          </View>
        );
      })}

      {!loading && grouped.length === 0 ? (
        <Text style={{ color: "#64748b" }}>No content versions generated yet.</Text>
      ) : null}
    </ScrollView>
  );
}
