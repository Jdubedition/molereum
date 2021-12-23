// Got ethers working in Cloudflare Workers thanks to workaround here: https://github.com/ethers-io/ethers.js/issues/1886
import { ethers } from "ethers"

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const re = /\/send\/(0x[a-fA-F0-9]{40}$)/
  const match = re.exec(url.pathname)

  // TODO
  // restrict to only faucet client and local development
  // limit number of transactions per day

  if (url.pathname === "/") {
    return new Response(`Welcome to the Molereum Faucet!`)
  } else if (match !== null) {
    const provider = new ethers.providers.JsonRpcProvider(MOLE_JSON_RPC_URL)
    const blockNumber = provider.getBlockNumber()
    const wallet = new ethers.Wallet(FAUCET_ACCOUNT_PRIVATE_KEY, provider)
    const tx = wallet.sendTransaction({
      to: match[1],
      value: ethers.utils.parseEther("0.5")
    })

    const result = await tx.then((r: any) => r)

    if (result.error) {
      return new Response(`Error while processing transfer request: ${result.error.message}`, { status: 500 })
    } else {
      return new Response(`${ethers.utils.formatEther(result.value)} MOLE successfully sent to ${result.to}`)
    }
  } else {
    return new Response(`Nothing to see here.`, { status: 404 })
  }
}
