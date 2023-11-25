/** @param {NS} ns */
export async function main(ns)
{
  let targets = ['home'];
  for(let targetInd = 0; targetInd < targets.length; targetInd++)
  {
    let subTargets = ns.scan(targets[targetInd]);
    for(let subInd = 0; subInd < subTargets.length; subInd++)
    {
      if(!targets.includes(subTargets[subInd]))
        targets.push(subTargets[subInd]);
    }
  }

  while(true)
  {
    let portTools = 0;
    if (ns.fileExists('BruteSSH.exe', 'home'))
      portTools++;
    if(ns.fileExists('FTPCrack.exe', 'home'))
      portTools++;
    if(ns.fileExists('relaySMTP.exe', 'home'))
      portTools++;
    if(ns.fileExists('HTTPWorm.exe', 'home'))
      portTools++;
    if(ns.fileExists('SQLInject.exe', 'home'))
      portTools++;
    
    for(let targetInd = 0; targetInd < targets.length; targetInd++)
    {
      let curTarget = targets[targetInd];
      if(!ns.hasRootAccess(curTarget))
      {
        if(ns.getServerRequiredHackingLevel(curTarget) < ns.getHackingLevel() && ns.getServerNumPortsRequired(curTarget) <= portTools)
        {
          if(ns.fileExists('BruteSSH.exe', 'home'))
            ns.brutessh(curTarget);
          if(ns.fileExists('FTPCrack.exe', 'home'))
            ns.ftpcrack(curTarget);
          if(ns.fileExists('relaySMTP.exe', 'home'))
            ns.relaysmtp(curTarget);
          if(ns.fileExists('HTTPWorm.exe', 'home'))
            ns.httpworm(curTarget);
          if(ns.fileExists('SQLInject.exe', 'home'))
            ns.sqlinject(curTarget);
          ns.nuke(curTarget);
          ns.tprint('Rooted ' + curTarget);
        }
      }
    }
    await ns.sleep(1000);
  }
}
