export async function handleRequest(request: Request): Promise<Response> {
  return new Response(`request method: ${request.method}  url: ${request.url}  cf.region: ${request.cf?.region}`);
}
