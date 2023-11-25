/** @param {NS} ns */
export async function main(ns)
{
  // How much RAM each upgraded server will have.
  const ram = ns.args[0];

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to upgrade servers until we've upgraded all of them
  while (i < ns.getPurchasedServerLimit())
  {
    // Check if we have enough money to upgrade a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost('phoenix_' + i, ram))
    {
      // If we have enough money, then upgrade the server
      let hostname = ns.upgradePurchasedServer("phoenix_" + i, ram);
      ns.tprint('phoenix_' + i + ' upgraded to ' + ram + 'GB')
      i++;
    }
    //Make the script wait for 1/10 second before looping again.
    await ns.sleep(100);
  }
}
