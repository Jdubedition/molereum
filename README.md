# molereum

1 mole (6.02214076×10<sup>23</sup>) of ether = Molereum (MOLE)

Network/Chain ID: 6022140761023

Registered on: [Chainlist](https://chainlist.org/)

## Features
Molereum is an Ethereum-based (go-ethereum node implementation) private network that uses PoA (Proof of Authority) Clique consensus and is used to operate DApps (decentralized applications).

Molereum will add a block every five seconds, which is about two to three times faster than Ethereum.

It is used during the development of DApps built by the [Jdubedition Github](https://github.com/Jdubedition) account.  In the future, a faucet might be added to the network to allow others to easily access the network to test their DApps.

## Sending MOLE to accounts
* SSH into the network host VM
* Attach to signer node `geth attach data-signer/geth.ipc`
* Transfer from signer account to wallet account `eth.sendTransaction({from: eth.coinbase, to: "<<supply account hash from wallet>>", value: web3.toWei(1, "ether")})`
* Verify that MOLE is now in the account in the wallet or by running `web3.fromWei(eth.getBalance("<<supply account hash from wallet>>"), "ether")`

## Steps used to create Molereum
* Setup this repository on GitHub
* Setup VM
* Create [Linode VM](https://www.linode.com/) with an Ubuntu 20.04 image using a shared CPU Nanode
* Install Geth
  * SSH into the VM, should be at /root
  * Use [Geth](https://geth.ethereum.org/docs/install-and-build/installing-geth) documentation
  * Went the route of using Ubuntu PPA
* Setup [Geth Private Network](https://geth.ethereum.org/docs/interface/private-network)
  * Create bootstrap node AKA PoA signer node
    * `geth account new --datadir data-signer`
      * Provide password
      * Copy account hash returned and save it in a very secure place
    * Copy genesis.json from this repo to VM with `scp codestore/molereum/genesis.json root@<<public IP address of VM>>:/root/`
    * Update genesis.json with the account hash from earlier step, but do not include the "0x" prefix
    * `geth init --datadir data-signer genesis.json` initialize the database
    * Create password file and place password from earlier step in it
    * To keep the node running but use the terminal, we are going to use `screen -S geth-signer`
    * Start the signer: `geth --nodiscover --datadir data-signer --networkid 6022140761023 --unlock <<supply account hash from earlier step>> --mine --netrestrict 127.0.0.1/32 --allow-insecure-unlock --password ./password` start the node
    * You should see messages like mined potential block, commit new mining work, successfully mined block, etc.
    * Detach from the screen to leave node running in the background `Ctrl+A,D`
    * Very that there is one mole of ether in the account
      * Attach to interactive console for signer node `geth attach data-signer/geth.ipc`
      * Run `web3.fromWei(eth.getBalance(eth.coinbase), "ether")`
      * Should return `6.02214076e+23`
      * `exit` the interactive console
  * Create peer node AKA service node
    * Create a new data directory `geth init --datadir data-peer genesis.json`
    * Get enr value from bootstrap node `geth attach data-signer/geth.ipc --exec admin.nodeInfo.enr`
    * To keep the node running but use the terminal, we are going to use `screen -S geth-peer`
    * Start the peer: `geth --datadir data-peer --networkid 6022140761023 --port 30305 --bootnodes <<supply signer enr value from earlier step>> --http --http.addr 127.0.0.1 --netrestrict 127.0.0.1/32 --nodiscover --http.vhosts=molereum.jdubedition.com`
    * Detach from the screen to leave node running in the background `Ctrl+A,D`
  * Setup peer node as peer of bootstrap node
    * Get enode value from peer node `geth attach data-peer/geth.ipc --exec admin.nodeInfo.enode`
    * Attach to signer node `geth attach data-signer/geth.ipc`
    * Add peer node to signer node, should return true `admin.addPeer(<<supply peer enode value from earlier step>>)`
    * `exit`
    * Check that peer node has connected to signer node `screen -r geth-peer`
    * Should see "Imported new chain segment" in the terminal, every five seconds
    * Detach from the screen to leave node running in the background `Ctrl+A,D`
  * Verify that bootstrap and peer node screens are detached `screen -ls`
  * Expose peer node to the internet behind a domain name, using [CloudFlare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide)
    * Setup cloudflared using instructions provided in link above as inspiration, plus specifics in next steps
    * `cloudflared tunnel create molereum`
    * Copy tunnel UUID from terminal output
    * Create config.yml with `vim .cloudflared/config.yml` using the following with the UUID from the terminal output:
      ```
      url: http://localhost:8545
      tunnel: <Tunnel-UUID>
      credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
      ```
    * Register route to subdomain `cloudflared tunnel route dns molereum molereum.jdubedition.com`
    * Run the tunnel to test connectivity `cloudflared tunnel run molereum`
    * Make sure we get a 200 status code response from `curl -v https://molereum.jdubedition.com`
    * Setup cloudflared tunnel as a service
      * `cloudflared service install`, this will copy the config files from /root/.cloudflared/ to /etc/cloudflared/
      * `systemctl start cloudflared` to start service
      * `systemctl enable cloudflared` to enable service on startup of VM
  * Setup crypto wallet or use existing one
    * Create new wallet provided by Brave Browser crypto wallet feature (which appears to be based on MetaMask) and make sure to save password and seed phrase in a secure place
    * Add a new network to the wallet
      * Name: Molereum
      * New RPC URL: https://molereum.jdubedition.com
      * Chain ID: 6022140761023
      * Symbol: MOLE
    * With the network registered and selected in wallet, you should see that there is now 0 MOLE in the account
    * Add one MOLE to the account
      * Copy the account hash from wallet
      * Attach to signer node `geth attach data-signer/geth.ipc`
      * Transfer from signer account to wallet account `eth.sendTransaction({from: eth.coinbase, to: "<<supply account hash from wallet>>", value: web3.toWei(1, "ether")})`
      * Verify that MOLE is now in the account in the wallet or by running `web3.fromWei(eth.getBalance("<<supply account hash from wallet>>"), "ether")`
  * Create faucet
    * Setup account in wallet and add ether (geth doesn't expose privatekey so need to use wallet)
      * Attach to signer node `geth attach data-signer/geth.ipc`
      * Transfer from signer account to sharing account `eth.sendTransaction({from: eth.coinbase, to: "<<supply account hash from wallet>>", value: web3.toWei(1000, "ether")})`
      * Verify that MOLE is now in the account in the wallet or by running `web3.fromWei(eth.getBalance("<<supply account hash from wallet>>"), "ether")`
    * TODO - add remaining steps to setup faucet
* Register private network ID on [chainlist.org](https://chainlist.org/)
  * Fork [ethereum-lists/chains](https://github.com/ethereum-lists/chains)
  * Clone repo to workstation
  * `cd _data/chains` and create eip155-6022140761023.json from a copy of eip155-2.json
  * Commit changes and push to GitHub
  * Open pull request and try to get merged
