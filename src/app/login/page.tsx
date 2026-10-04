"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

const WORDMARK_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIzNThweCIgaGVpZ2h0PSIxNDJweCIgc3R5bGU9InNoYXBlLXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247IHRleHQtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgaW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsgZmlsbC1ydWxlOmV2ZW5vZGQ7IGNsaXAtcnVsZTpldmVub2RkIiB2aWV3Qm94PSIwIDAgNzIuOTIgMjguODciPiA8ZGVmcz4gIDxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+ICAgPCFbQ0RBVEFbICAgIC5maWwwIHtmaWxsOiNEODFGMjY7ZmlsbC1ydWxlOm5vbnplcm99ICAgXV0+ICA8L3N0eWxlPiA8L2RlZnM+IDxnIGlkPSJMYXllcl94MDAyMF8xIj4gIDxtZXRhZGF0YSBpZD0iQ29yZWxDb3JwSURfMENvcmVsLUxheWVyIj48L21ldGFkYXRhPiAgPHBhdGggY2xhc3M9ImZpbDAiIGQ9Ik0zMS4xOCAwLjY0bC0wLjc0IDAgMCAtMC42NCAyLjE4IDAgMCAwLjY0IC0wLjc0IDAgMCAzLjg0IC0wLjcgMCAwIC0zLjg0em0zNy4zIDI4LjAyYy0xLjQzLC0wLjI1IC0yLjU0LC0wLjgyIC0zLjMsLTEuNzggLTAuNzUsLTAuOTUgLTEuMTQsLTIuMTkgLTEuMTQsLTMuNzQgMCwtMS42OCAwLC0zLjM2IDAsLTUuMDQgMCwtMS42OCAwLC0zLjM2IDAsLTUuMDQgMCwtMS41NSAwLjM5LC0yLjc0IDEuMTQsLTMuNTcgMC43NiwtMC44MyAxLjg2LC0xLjI1IDMuMywtMS4yNSAxLjQ0LDAgMi41NSwwLjQ0IDMuMywxLjMzIDAuNzYsMC45IDEuMTQsMi4yIDEuMTQsMy44NyAwLDAuNTkgMCwxLjE5IDAsMS43OCAtMC45NCwtMC4wNiAtMS44OCwtMC4xMyAtMi44MiwtMC4xOSAwLC0wLjY0IDAsLTEuMjggMCwtMS45MiAwLC0xLjMzIC0wLjUxLC0yLjAxIC0xLjUzLC0yLjAzIC0xLjAzLC0wLjAzIC0xLjU1LDAuNjEgLTEuNTUsMS45IDAsMS43OSAwLDMuNTggMCw1LjM3IDAsMS43OSAwLDMuNTggMCw1LjM3IDAsMS4yNyAwLjUyLDEuOTYgMS41NSwyLjEyIDEuMDIsMC4xNiAxLjUzLC0wLjQgMS41MywtMS43IDAsLTEuMzIgMCwtMi42MyAwLC0zLjk1IC0wLjQ5LC0wLjA1IC0wLjk5LC0wLjExIC0xLjQ4LC0wLjE3IDAsLTAuOTQgMCwtMS44OSAwLC0yLjgzIDEuNDMsMC4xMiAyLjg2LDAuMjQgNC4zLDAuMzYgMCwxLjEzIDAsMi4yNiAwLDMuMzkgMCwxLjEzIDAsMi4yNiAwLDMuMzggMCwxLjY4IC0wLjM4LDIuOSAtMS4xNCwzLjY2IC0wLjc1LDAuNzQgLTEuODUsMC45NCAtMy4zLDAuNjh6bS0xNS43NiAtMjAuMTdjMS4yNCwwLjAxIDIuNDgsMC4wMSAzLjczLDAuMDEgMC40OCwxLjgzIDAuOTYsMy42NyAxLjQ0LDUuNTIgMC40OCwxLjg2IDAuOTYsMy43MyAxLjQ1LDUuNjEgMC4wMiwwIDAuMDQsMCAwLjA2LDAgMCwtMS44NSAwLC0zLjcxIDAsLTUuNTYgMCwtMS44NiAwLC0zLjcxIDAsLTUuNTcgMC44OCwwIDEuNzYsMC4wMSAyLjY1LDAuMDEgMCwzLjE1IDAsNi4zMSAwLDkuNDYgMCwzLjE1IDAsNi4zMSAwLDkuNDYgLTEuMDIsLTAuMTMgLTIuMDQsLTAuMjUgLTMuMDYsLTAuMzcgLTAuNiwtMi4zMSAtMS4xOSwtNC42MSAtMS43OCwtNi44OSAtMC41OSwtMi4yNiAtMS4xOSwtNC41MiAtMS43OCwtNi43NiAtMC4wMywwIC0wLjA1LDAgLTAuMDYsMCAwLDIuMjIgMCw0LjQzIDAsNi42NSAwLDIuMjEgMCw0LjQzIDAsNi42NCAtMC44OCwtMC4wOCAtMS43NywtMC4xNCAtMi42NSwtMC4yIDAsLTMgMCwtNiAwLC05IDAsLTMgMCwtNiAwLC05LjAxem0tNS4xOSAwYzAuOTksMCAxLjk4LDAgMi45NywwIDAsMi45OCAwLDUuOTUgMCw4LjkzIDAsMi45NyAwLDUuOTUgMCw4LjkyIC0wLjk5LC0wLjA2IC0xLjk4LC0wLjExIC0yLjk3LC0wLjE2IDAsLTIuOTUgMCwtNS45IDAsLTguODQgMCwtMi45NSAwLC01LjkgMCwtOC44NXptLTEwLjk4IDBjMS41MSwwIDMuMDIsMCA0LjU0LDAgMS40OCwwIDIuNTksMC4zNyAzLjMyLDEuMSAwLjc1LDAuNzQgMS4xMSwxLjgyIDEuMTEsMy4yNSAwLDEuNDggMCwyLjk3IDAsNC40NSAwLDEuNDggMCwyLjk2IDAsNC40NSAwLDEuNDIgLTAuMzYsMi40OCAtMS4xMSwzLjIgLTAuNzMsMC43MiAtMS44NCwxLjA2IC0zLjMyLDEuMDIgLTEuNTIsLTAuMDMgLTMuMDMsLTAuMDMgLTQuNTQsLTAuMDMgMCwtMi45MSAwLC01LjgxIDAsLTguNzIgMCwtMi45MSAwLC01LjgyIDAsLTguNzJ6bTQuNDkgMTQuOThjMC40OSwwLjAxIDAuODYsLTAuMTIgMS4xMiwtMC4zOCAwLjI3LC0wLjI2IDAuNCwtMC42OSAwLjQsLTEuMjkgMCwtMS41MiAwLC0zLjA0IDAsLTQuNTYgMCwtMS41MSAwLC0zLjAzIDAsLTQuNTUgMCwtMC42IC0wLjE0LC0xLjAzIC0wLjQsLTEuMyAtMC4yNiwtMC4yNyAtMC42MywtMC40MSAtMS4xMiwtMC40MSAtMC41MSwwIC0xLjAxLDAgLTEuNTIsMCAwLDIuMDggMCw0LjE2IDAsNi4yMyAwLDIuMDggMCw0LjE2IDAsNi4yMyAwLjUxLDAuMDEgMS4wMSwwLjAyIDEuNTIsMC4wM3ptLTE1LjQ3IC0xNC45OGMxLjUxLDAgMy4wMywwIDQuNTUsMCAxLjQ4LDAgMi41OCwwLjM2IDMuMzIsMS4xIDAuNzQsMC43MyAxLjExLDEuOCAxLjExLDMuMjEgMCwxLjQ3IDAsMi45NCAwLDQuNDEgMCwxLjQ3IDAsMi45NCAwLDQuNDEgMCwxLjQyIC0wLjM3LDIuNSAtMS4xMSwzLjI0IC0wLjc0LDAuNzUgLTEuODQsMS4xMiAtMy4zMiwxLjE2IC0xLjUyLDAuMDUgLTMuMDQsMC4xMyAtNC41NSwwLjE4IDAsLTIuOTUgMCwtNS45IDAsLTguODUgMCwtMi45NSAwLC01LjkxIDAsLTguODZ6bTQuNDkgMTUuMDNjMC40OSwtMC4wMSAwLjg2LC0wLjE1IDEuMTIsLTAuNDIgMC4yNiwtMC4yOCAwLjM5LC0wLjcxIDAuMzksLTEuMzEgMCwtMS41MiAwLC0zLjAzIDAsLTQuNTUgMCwtMS41MiAwLC0zLjAzIDAsLTQuNTUgMCwtMC42IC0wLjEzLC0xLjAzIC0wLjM5LC0xLjMgLTAuMjYsLTAuMjYgLTAuNjMsLTAuNCAtMS4xMiwtMC40IC0wLjUxLDAuMDEgLTEuMDEsMC4wMSAtMS41MSwwLjAxIDAsMi4xIDAsNC4xOSAwLDYuMjkgMCwyLjA5IDAsNC4xOSAwLDYuMjggMC41LC0wLjAyIDEsLTAuMDQgMS41MSwtMC4wNXptLTE0LjMgLTE1LjAyYzIuNywwIDUuNDEsLTAuMDEgOC4xMSwtMC4wMSAwLDAuODUgMCwxLjcgMCwyLjU1IC0xLjcxLDAuMDEgLTMuNDIsMC4wMyAtNS4xNCwwLjA1IDAsMC44IDAsMS42IDAsMi40MSAwLDAuOCAwLDEuNTkgMCwyLjM5IDEuMzYsLTAuMDQgMi43MiwtMC4wOCA0LjA5LC0wLjEyIDAsMC44NSAwLDEuNyAwLDIuNTYgLTEuMzcsMC4wNCAtMi43MywwLjEgLTQuMDksMC4xNiAwLDAuOTMgMCwxLjg2IDAsMi43OSAwLDAuOTMgMCwxLjg2IDAsMi43OSAxLjcyLC0wLjEyIDMuNDMsLTAuMjIgNS4xNCwtMC4zMSAwLDAuODUgMCwxLjcgMCwyLjU0IC0yLjcsMC4xNyAtNS40MSwwLjM5IC04LjExLDAuNjMgMCwtMy4wNyAwLC02LjE1IDAsLTkuMjIgMCwtMy4wNiAwLC02LjE0IDAsLTkuMjF6bS0xNS43NiAwLjAzYzAuOTYsMCAxLjkxLDAgMi44NywwIDAuMjEsMi41NyAwLjQzLDUuMTQgMC42NSw3LjY5IDAuMjIsMi41NSAwLjQ0LDUuMDkgMC42Nyw3LjYyIDAuMDEsMCAwLjAzLC0wLjAxIDAuMDUsLTAuMDEgMC4yNCwtMi41NyAwLjQ3LC01LjE0IDAuNywtNy43IDAuMjQsLTIuNTQgMC40NywtNS4wOCAwLjcsLTcuNjEgMS4wOCwwIDIuMTYsLTAuMDEgMy4yNSwtMC4wMSAwLjIzLDIuNDYgMC40Nyw0LjkxIDAuNyw3LjM1IDAuMjMsMi40NCAwLjQ3LDQuODYgMC43MSw3LjI4IDAuMDEsMCAwLjAzLDAgMC4wNSwtMC4wMSAwLjIyLC0yLjQ1IDAuNDQsLTQuOSAwLjY2LC03LjM0IDAuMjIsLTIuNDQgMC40NCwtNC44NiAwLjY2LC03LjI4IDAuODYsLTAuMDEgMS43MiwtMC4wMSAyLjU4LC0wLjAxIC0wLjMyLDMuMTEgLTAuNjQsNi4yMiAtMC45Niw5LjM1IC0wLjMzLDMuMTMgLTAuNjUsNi4yOCAtMC45Nyw5LjQ0IC0xLjI0LDAuMTUgLTIuNDcsMC4zMSAtMy43LDAuNDggLTAuMjMsLTIuMTQgLTAuNDYsLTQuMjggLTAuNjgsLTYuNDMgLTAuMjIsLTIuMTYgLTAuNDUsLTQuMzIgLTAuNjcsLTYuNDkgLTAuMDIsMCAtMC4wNCwwIC0wLjA2LDAgLTAuMjIsMi4yIC0wLjQ2LDQuNDIgLTAuNjgsNi42MyAtMC4yMiwyLjIzIC0wLjQ1LDQuNDYgLTAuNjcsNi43IC0xLjMyLDAuMjIgLTIuNjMsMC40NCAtMy45NCwwLjY5IC0wLjMyLC0zLjM0IC0wLjY1LC02LjcgLTAuOTYsLTEwLjA4IC0wLjMyLC0zLjQgLTAuNjUsLTYuODEgLTAuOTYsLTEwLjI2em0zNC43NiAtOC41M2wwLjcgMCAwIDEuODMgMi4wNyAwIDAgLTEuODMgMC43IDAgMCA0LjQ4IC0wLjcgMCAwIC0yLjAxIC0yLjA3IDAgMCAyLjAxIC0wLjcgMCAwIC00LjQ4em01LjggMGwxLjkyIDAgMCAwLjY0IC0xLjIyIDAgMCAxLjE5IDAuOTcgMCAwIDAuNjQgLTAuOTcgMCAwIDEuMzcgMS4yMiAwIDAgMC42NCAtMS45MiAwIDAgLTQuNDh6Ij48L3BhdGg+IDwvZz48L3N2Zz4=";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("PIN harus 6 angka.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message || "PIN salah.");
        setSubmitting(false);
      }
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center flex flex-col items-center">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-5">
            Akses Sebar Undangan
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={WORDMARK_SVG}
            alt="The Wedding"
            width={160}
            height={64}
            className="block w-40 h-auto"
          />
          <div className={bebasNeue.className}>
            <span className="block text-[11px] tracking-[0.42em] indent-[0.42em] uppercase text-white mt-2">
              OF
            </span>
            <span className="block text-2xl tracking-wider uppercase text-white mt-1">
              ANNIS &amp; SALAFI
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="mb-2 block text-center text-sm text-[var(--muted)]">
              PIN Sebar
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-center text-lg tracking-[0.5em] text-[var(--foreground)] focus:border-[var(--red)]"
              placeholder="••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-[var(--red)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[var(--red)] py-3 font-medium text-white transition hover:bg-[var(--red-dark)] disabled:opacity-60"
          >
            {submitting ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
