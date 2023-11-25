/** @param {NS} ns */
export async function main(ns)
{
  //Writes information about infiltration targets to logFile
  
  let logFile = 'infData.txt';

  let dataSet = ns.infiltration.getPossibleLocations();
  ns.write(logFile,'','w');
  //Pick target servers
  let locSorted = [];
  let locDiff = [];
  for(let loc of dataSet)
  {
    let locData = ns.infiltration.getInfiltration(loc.name);
    let curDiff = locData.difficulty;
    let i = 0;
    while(i < locSorted.length && locDiff[i] > curDiff)
      i++;
    locSorted.splice(i,0,locData);
    locDiff.splice(i,0,curDiff);
  }
  locSorted.reverse();

  for(let loc of locSorted)
  {
    ns.write(logFile, loc.location.city + '\n', 'a');
    ns.write(logFile, loc.location.name + '\n', 'a');
    ns.write(logFile, 'Diff: ' + Math.floor(loc.difficulty * 100) / 100 +'\n', 'a');
    ns.write(logFile, 'Levels: ' + loc.location.infiltrationData.maxClearanceLevel + '\n', 'a');
    ns.write(logFile, 'Rewards: ' + Math.floor(loc.reward.tradeRep / 100) / 10 + '\n', 'a');
    ns.write(logFile, 'Reward/Level: ' + Math.floor((loc.reward.tradeRep / loc.location.infiltrationData.maxClearanceLevel) / 10) / 100 + '\n\n', 'a');
  }
}
