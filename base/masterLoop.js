/** @param {NS} ns */
export async function main(ns)
{
  //This is a master loop to try and dynamically identify optimal weaken/grow/hack allocation across multiple servers

  //Script names
  let hackScript   = 'hackOnce.js';
  let growScript   = 'growOnce.js';
  let weakenScript = 'weakenOnce.js';

  let hackCost = ns.getScriptRam(hackScript);
  let growCost = ns.getScriptRam(growScript);
  let weakenCost = ns.getScriptRam(weakenScript);

  let hackTolerance = 0.2;

  let logFile = 'logFileMasterLoop.txt';

  //Set up server list
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


  //Main loop
  while(true)
  {
    //Pick target servers
    let hackTargetName = [];
    let hackTargetMoney = [];
    for(let curTarget of targets)
    {
      if(ns.hasRootAccess(curTarget) && ns.getServerRequiredHackingLevel(curTarget) * 1 < ns.getHackingLevel())
      {
        let curMoney = ns.getServerMaxMoney(curTarget);
        if(curMoney > 0)
        {
          let i = 0;
          while(i < hackTargetName.length && hackTargetMoney[i] > curMoney)
          {
            i++;
          }
          hackTargetName.splice(i,0,curTarget);
          hackTargetMoney.splice(i,0,curMoney);
        }
      }
    }

    //Trying out reversal for early game
    hackTargetName.reverse();

    //Set up better log file
    ns.write(logFile, '', 'w');
    

    //From richest to poorest server, allocate threads
    for(let hackTarget of hackTargetName)
    {
      //Identify current amount of needed weaken/grow calls
      let securityGap    = Math.max(0, 5 + ns.getServerBaseSecurityLevel(hackTarget) - ns.getServerSecurityLevel(hackTarget));
      let weakenRequired = Math.floor((ns.getServerSecurityLevel(hackTarget) - ns.getServerMinSecurityLevel(hackTarget)) * 20);
      let growRequired   = Math.floor(Math.min(ns.growthAnalyze(hackTarget, (ns.getServerMaxMoney(hackTarget) + 1) / (ns.getServerMoneyAvailable(hackTarget) + 1)), securityGap * 125));
      let hackRequired   = Math.floor(Math.min(hackTolerance / ns.hackAnalyze(hackTarget), securityGap * 250));

      
      //Don't hack if server money is too low
      if(ns.getServerMaxMoney(hackTarget) * (1 - hackTolerance) > ns.getServerMoneyAvailable(hackTarget))
        hackRequired = 0;


      //Identify current number of pending weaken/grow calls
      let weakenPending = 0;
      let growPending   = 0;
      let hackPending   = 0;
      for(let targetInd = 0; targetInd < targets.length; targetInd++)
      {
        let curTarget = targets[targetInd];
        if(ns.hasRootAccess(curTarget))
        {
          let curCalls = ns.ps(curTarget);
          for(let call of curCalls)
          {
            if(call.filename == weakenScript && call.args[0] == hackTarget)
              weakenPending += call.threads;
            if(call.filename == growScript && call.args[0] == hackTarget)
              growPending += call.threads;
            if(call.filename == hackScript && call.args[0] == hackTarget)
              hackPending += call.threads;
          }
        }
      }

      //Increase weaken calls required by pending grow/hack threads
      weakenRequired += Math.floor(growPending / 12.5);
      weakenRequired += Math.floor(hackPending / 25);

      //Scan rooted servers and run weaken/grow/hack as needed in all available RAM
      for(let targetInd = 0; targetInd < targets.length; targetInd++)
      {
        let curTarget = targets[targetInd];
        let homeOffset = 0
        if(targetInd == 0)
          homeOffset = 32;

        if(ns.hasRootAccess(curTarget))
        {
          //copy scripts if needed
          if(!ns.fileExists(weakenScript, curTarget))
          {
            ns.scp(weakenScript, curTarget)
            ns.scp(growScript, curTarget)
            ns.scp(hackScript, curTarget)
          }

          //weaken
          if(weakenRequired > weakenPending)
          {
            let threadCount = Math.min(weakenRequired - weakenPending, Math.floor((ns.getServerMaxRam(curTarget) - ns.getServerUsedRam(curTarget) - homeOffset) / weakenCost));
            if(threadCount > 0)
            {
              ns.exec(weakenScript, curTarget, threadCount, hackTarget);
              weakenPending += threadCount;
            }
          }

          //grow
          if(growRequired > growPending)
          {
            let threadCount = Math.min(growRequired - growPending, Math.floor((ns.getServerMaxRam(curTarget) - ns.getServerUsedRam(curTarget) - homeOffset) / growCost));
            if(threadCount > 0)
            {
              ns.exec(growScript, curTarget, threadCount, hackTarget);
              growPending += threadCount;
            }
          }

          //hack
          if(hackRequired > hackPending)
          {
            let threadCount = Math.min(hackRequired - hackPending, Math.floor((ns.getServerMaxRam(curTarget) - ns.getServerUsedRam(curTarget) - homeOffset) / hackCost));
            if(threadCount > 0)
            {
              ns.exec(hackScript, curTarget, threadCount, hackTarget);
              hackPending += threadCount;
            }
          }
        }
      }

      //print status to log
      ns.write(logFile, 'For server ' + hackTarget + ":\n", 'a');
      ns.write(logFile, 'Server money ' + Math.floor(ns.getServerMoneyAvailable(hackTarget) / 10000) / 100 + ' of max ' + Math.floor(ns.getServerMaxMoney(hackTarget) / 10000) / 100 + ' (' + Math.floor(100 * ns.getServerMoneyAvailable(hackTarget) / ns.getServerMaxMoney(hackTarget)) + '%)\n', 'a');
      ns.write(logFile, 'Running ' + weakenPending + ' of ' + weakenRequired + ' weaken scripts.\n', 'a');
      ns.write(logFile, 'Running ' + growPending + ' of ' + growRequired + ' grow scripts.\n', 'a');
      ns.write(logFile, 'Running ' + hackPending + ' of ' + hackRequired + ' hack scripts.\n\n', 'a');
    }

    //Pause for a breather to get rid of that annoying red box
    await ns.sleep(10);
  }
}
