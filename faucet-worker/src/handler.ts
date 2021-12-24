// Got ethers working in Cloudflare Workers thanks to workaround here: https://github.com/ethers-io/ethers.js/issues/1886
import { ethers } from "ethers"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const re = /\/send\/(0x[a-fA-F0-9]{40}$)/
  const match = re.exec(url.pathname)

  // TODO
  // restrict to only faucet client and local development
  // restrict CORS to localhost and faucet client
  // limit number of transactions per day

  if (match !== null) {
    const provider = new ethers.providers.JsonRpcProvider(MOLE_JSON_RPC_URL)
    const wallet = new ethers.Wallet(FAUCET_ACCOUNT_PRIVATE_KEY, provider)
    const tx = wallet.sendTransaction({
      to: match[1],
      value: ethers.utils.parseEther("0.5")
    })

    const result = await tx.then((r: any) => r)

    if (result.error) {
      return new Response(`Error while processing transfer request: ${result.error.message}`, { status: 500, headers: corsHeaders })
    } else {
      return new Response(`${ethers.utils.formatEther(result.value)} MOLE successfully sent to ${result.to}`, { status: 200, headers: corsHeaders })
    }
  } else {
    return new Response(`Nothing to see here.`, { status: 404, headers: corsHeaders })
  }
}
