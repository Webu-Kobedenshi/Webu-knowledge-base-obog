function getRequestOrigin(request: Request) {
  const origin = new URL(request.url).origin;
  return origin.replace("://0.0.0.0", "://localhost");
}

export function getPublicOrigin(request: Request) {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || getRequestOrigin(request);
}

export function createPublicUrl(pathname: string, request: Request) {
  return new URL(pathname, getPublicOrigin(request));
}
