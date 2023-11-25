/** @param {NS} ns */
export async function main(ns)
{
  //This code finds all .cct files on rooted machines
  
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

  for(let targetInd = 0; targetInd < targets.length; targetInd++)
  {
    let curTarget = targets[targetInd];
    if(ns.hasRootAccess(curTarget))
    {
      for(let curFile of ns.ls(curTarget))
      {
        if(curFile.includes('.cct'))
          ns.tprint(curTarget + ' ' + curFile)
      }
    }
  }
}
