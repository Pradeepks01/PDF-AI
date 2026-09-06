import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Check all proxy and platform headers (Vercel, Cloudflare, AWS, Nginx, Render)
    const headerCandidates = [
      req.headers.get("x-vercel-forwarded-for"),
      req.headers.get("x-forwarded-for"),
      req.headers.get("x-real-ip"),
      req.headers.get("cf-connecting-ip"),
      req.headers.get("x-client-ip"),
      req.headers.get("fastly-client-ip"),
      req.headers.get("true-client-ip")
    ];

    let clientIp: string | null = null;

    for (const header of headerCandidates) {
      if (header && header.trim()) {
        const ip = header.split(",")[0].trim();
        if (ip && ip !== "::1" && ip !== "127.0.0.1") {
          clientIp = ip;
          break;
        }
      }
    }

    // 2. If running on localhost or inside private network, resolve real public IP
    if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1" || clientIp.startsWith("192.168.") || clientIp.startsWith("10.") || clientIp.startsWith("172.")) {
      const publicProviders = [
        "https://api.ipify.org?format=json",
        "https://ipinfo.io/json",
        "https://api.myip.com"
      ];

      for (const provider of publicProviders) {
        try {
          const res = await fetch(provider, {
            cache: "no-store",
            signal: AbortSignal.timeout(2500)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.ip) {
              clientIp = data.ip;
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }

    return NextResponse.json({
      ip: clientIp || "127.0.0.1",
      detectedAt: new Date().toISOString()
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (error) {
    return NextResponse.json({ ip: "127.0.0.1" });
  }
}
