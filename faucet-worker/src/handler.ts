// Got ethers working in Cloudflare Workers thanks to workaround here: https://github.com/ethers-io/ethers.js/issues/1886
import { ethers } from "ethers"

let iface = new ethers.utils.Interface([
  "function getNumStories() view returns (uint256)",
  "function getStoryTitles() view returns (string[2][])"
]);

export async function handleRequest(request: Request): Promise<Response> {

  const url = new URL(request.url);

  console.log(url.origin, url.hostname)

  if (url.pathname === "/") {
    return new Response(`Welcome to the Molereum Faucet!`)
  } else if (url.pathname === "/transfer") {
    const provider = new ethers.providers.JsonRpcProvider(MOLE_JSON_RPC_URL)
    const blockNumber = provider.getBlockNumber()
    const wallet = new ethers.Wallet(FAUCET_ACCOUNT_PRIVATE_KEY || "", provider)
    const tx = wallet.sendTransaction({
      to: "0x2eEFdfF1D47E688F8f467Bf9a48622054e05A7Fd",
      value: ethers.utils.parseEther("0.5")
    });

    const message = await fetch(
      MOLE_JSON_RPC_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: 2.0,
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }
        )
      })

    const message2 = await fetch(
      MOLE_JSON_RPC_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: 2.0,
          method: 'eth_call',
          params: [
            {
              from: '0x2eEFdfF1D47E688F8f467Bf9a48622054e05A7Fd',
              to: '0xdA60949737DF4077a4E1Dd600fE79c989457B1Cd',
              data: iface.encodeFunctionData("getNumStories", []),
            }, "latest"],
          id: 1
        })
      })

    const message3 = await fetch(
      MOLE_JSON_RPC_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: 2.0,
          method: 'eth_call',
          params: [
            {
              from: '0x2eEFdfF1D47E688F8f467Bf9a48622054e05A7Fd',
              to: '0xdA60949737DF4077a4E1Dd600fE79c989457B1Cd',
              data: '0x4be6fee0',
            }, "latest"],
          id: 1
        })
      })

    const message2Result = await message2.json().then((x: any) => iface.decodeFunctionResult("getNumStories", x.result))
    const message3Result = await message3.json().then((x: any) => iface.decodeFunctionResult("getStoryTitles", x.result))

    return new Response(`
    request method: ${request.method}
    url: ${request.url}
    cf.region: ${request.cf?.region}
    blockNumber: ${await message.json().then((x: any) => parseInt(x.result, 16))}
    message2Status: ${message2.status}
    numberOfStories: ${message2Result}
    message2Status: ${message3.status}
    storyTitles: ${message3Result}
    blockNumberFromEthers: ${await blockNumber.then((x: any) => parseInt(x, 16))}
    signerTransaction: ${await tx.then((x: any) => Object.getOwnPropertyNames(x))}
    `
    )
  } else {
    return new Response(`Nothing to see here.`, { status: 404 })
  }
}
