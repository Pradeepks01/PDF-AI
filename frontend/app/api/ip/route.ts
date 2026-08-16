import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Try standard forwarder headers (proxies, Vercel, Cloudflare, Nginx)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    
    let clientIp = forwardedFor 
      ? forwardedFor.split(",")[0].trim() 
      : (realIp || cfConnectingIp || null);

    // 2. If running locally (localhost ::1 or 127.0.0.1), resolve the machine's actual public IPv4 address
    if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1" || clientIp.startsWith("192.168.") || clientIp.startsWith("10.")) {
      try {
        const publicIpRes = await fetch("https://api.ipify.org?format=json", { 
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });
        if (publicIpRes.ok) {
          const data = await publicIpRes.json();
          if (data.ip) {
            clientIp = data.ip;
          }
        }
      } catch (err) {
        // fallback to detected IP
      }
    }

    return NextResponse.json({
      ip: clientIp || "127.0.0.1",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ ip: "127.0.0.1" });
  }
}
