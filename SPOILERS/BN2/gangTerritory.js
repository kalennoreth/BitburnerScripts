/** @param {NS} ns */
export async function main(ns)
{
  /*
  Territory control management. General goals:
  - Ascend members when needed/reasonable
  - Equip members with affordable upgrades
  - Train stats as needed
  - Run territory warfare for gang strength until significantly above rival gangs
  */

  //assumptions
  let equipThresh = 0.05;
  let ascendThresh = 1.5;
  let respectThresh = 200000;


  //Main loop
  while(true)
  {
    //get gang roster
    let curMembers = ns.gang.getMemberNames();
    let curSize = curMembers.length;
    let totalRespect = 0;
    for(let member of curMembers)
      totalRespect += ns.gang.getMemberInformation(member).earnedRespect;

    
    //ascend members
    for(let member of curMembers)
    {
      let mStats = ns.gang.getMemberInformation(member);
      let mAsc = ns.gang.getAscensionResult(member);
      if((mAsc.str + mAsc.def + mAsc.dex + mAsc.def) / 4 > ascendThresh && (totalRespect - mStats.earnedRespect) > respectThresh)
      {
        //ascend this member and reduce totalRespect accordingly
        totalRespect -= mStats.earnedRespect;
        ns.gang.ascendMember(member);
        ns.tprint('Ascended ' + member);
        ns.gang.setMemberTask(member, 'Train Combat');
      }
    }


    //equip members
    for(let member of curMembers)
    {
      let mStats = ns.gang.getMemberInformation(member);
      let allEquip = ns.gang.getEquipmentNames()
      let mEquip = mStats.upgrades.concat(mStats.augmentations);
      
      for(let curEquip of allEquip)
      {
        //Skipping rootkits for now
        if(!mEquip.includes(curEquip) && !(ns.gang.getEquipmentType(curEquip) == 'Rootkit'))
        {
          let price = ns.gang.getEquipmentCost(curEquip);
          let funds = ns.getServerMoneyAvailable('home');
          if(price < funds * equipThresh)
          {
            ns.gang.purchaseEquipment(member, curEquip);
            ns.tprint('Bought ' + curEquip + ' for ' + member);
          }
        }
      }
    }
    

    //Assign tasks to members
    for(let member of curMembers)
    {
      let mStats = ns.gang.getMemberInformation(member);
      let gangInfo = ns.gang.getGangInformation();
      
      //Set primary crime and stat threshold
      let trainOp = 'Train Combat';
      let wantedOp = 'Vigilante Justice';
      let targetOp = 'Territory Warfare';
      let respectOp = 'Terrorism';
      let statThresh = 300;
      let wantedThresh = 5 + gangInfo.respect * 0.02;

      if(Math.min(mStats.str, mStats.def, mStats.dex, mStats.agi) < statThresh)
      {
        if(mStats.task != trainOp)
          ns.gang.setMemberTask(member, trainOp);
      }
      else if(gangInfo.wantedLevel > wantedThresh)
      {
        if(mStats.task != wantedOp)
          ns.gang.setMemberTask(member, wantedOp);
      }
      else if(mStats.earnedRespect < respectThresh)
      { 
        if(mStats.task != respectOp)
          ns.gang.setMemberTask(member, respectOp);
      }
      else
      {
        if(mStats.task != targetOp)
          ns.gang.setMemberTask(member, targetOp);
      }
    }

    //loop delay
    await ns.sleep(10000);
  }
}
