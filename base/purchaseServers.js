/** @param {NS} ns */
export async function main(ns)
{
  // How much RAM each purchased server will have. In this case, it'll be 2GB.
  const ram = 2;

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to purchase servers until we've reached the maximum amount of servers
  while (i < ns.getPurchasedServerLimit())
  {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram))
    {
      // If we have enough money, then purchase the server
      let hostname = ns.purchaseServer("phoenix_" + i, ram);
      ns.tprint('phoenix_' + i + ' purchased with ' + ram + 'GB RAM')
      i++;
    }
    //Make the script wait for 1/10 second before looping again.
    await ns.sleep(100);
  }
}
