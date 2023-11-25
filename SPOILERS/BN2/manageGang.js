/** @param {NS} ns */
export async function main(ns)
{
  //assumptions
  let equipThresh = 0.05;
  let maxAscThresh = 4;
  let ascendThresh = 0.25;
  //["Unassigned","Mug People","Deal Drugs","Strongarm Civilians","Run a Con","Armed Robbery","Traffick Illegal Arms","Threaten & Blackmail","Human Trafficking","Terrorism","Vigilante Justice","Train Combat","Train Hacking","Train Charisma","Territory Warfare"]


  while(true)
  {
    //get gang roster
    let curMembers = ns.gang.getMemberNames();
    let curSize = curMembers.length;


    //attempt to recruit new members
    while(ns.gang.canRecruitMember())
    {
      let newMember = 'snake_' + curSize;
      ns.gang.recruitMember(newMember);
      ns.gang.setMemberTask(newMember, 'Train Combat');
      curMembers.push(newMember);
      ns.tprint('Recruited ' + newMember);
      curSize++;
    }
    

    //equip members
    for(let member of curMembers)
    {
      let mStats = ns.gang.getMemberInformation(member);
      let allEquip = ns.gang.getEquipmentNames()
      let mEquip = mStats.upgrades.concat(mStats.augmentations);
      
      for(let curEquip of allEquip)
      {
        //if(!mEquip.includes(curEquip))
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


    //Identify current ascension target
    let ascMember = ''
    let numAscMember = 0
    for(let member of curMembers)
    {
      let mStats = ns.gang.getMemberInformation(member);
      let levelMember = Math.min(mStats.str_asc_mult, mStats.def_asc_mult, mStats.dex_asc_mult, mStats.agi_asc_mult) < maxAscThresh;
      if(ascMember == '' && levelMember)
        ascMember = member;
      if(!levelMember)
        numAscMember++;
    }
    

    //If there's a member needing ascension, level/ascend them
    if(ascMember != '')
    {
      let mStats = ns.gang.getMemberInformation(ascMember);
      let mAsc = ns.gang.getAscensionResult(ascMember);
      if(mAsc != undefined)
      {
        //check if we need to level up combat
        let levelCombat = false;
        levelCombat = levelCombat || (mStats.str_asc_mult + ascendThresh > mStats.str_asc_mult * mAsc.str);
        levelCombat = levelCombat || (mStats.def_asc_mult + ascendThresh > mStats.def_asc_mult * mAsc.def);
        levelCombat = levelCombat || (mStats.dex_asc_mult + ascendThresh > mStats.dex_asc_mult * mAsc.dex);
        levelCombat = levelCombat || (mStats.agi_asc_mult + ascendThresh > mStats.agi_asc_mult * mAsc.agi);

        if(levelCombat)
        {
          if(mStats.task != 'Train Combat')
            ns.gang.setMemberTask(ascMember, 'Train Combat');
        }
        else
        {
          ns.gang.ascendMember(ascMember);
          ns.tprint('Ascended ' + ascMember);
          ns.gang.setMemberTask(ascMember, 'Train Combat');
        }
      }
      else
      {
        if(mStats.task != 'Train Combat')
          ns.gang.setMemberTask(ascMember, 'Train Combat');
      }
    }

    //Some enhancements to this section:
    //Figure out how to dynamically assign backupOp for fullyAsc members

    //Assign tasks to other members
    for(let member of curMembers)
    {
      if(member != ascMember)
      {
        let mStats = ns.gang.getMemberInformation(member);
        let fullyAsc = Math.min(mStats.str_asc_mult, mStats.def_asc_mult, mStats.dex_asc_mult, mStats.agi_asc_mult) >= maxAscThresh;
        let gangInfo = ns.gang.getGangInformation();
        
        //Set primary crime and stat threshold
        let primaryCrime = 'Mug People';
        let backupOp = 'Train Combat';
        let statThresh = 60;
        let respectThresh = (5 ** (curSize - 2)) / (curSize - 0.5);
        let wantedThresh = 5 + gangInfo.respect * 0.02;
        if(numAscMember > 0)
        {
          statThresh = 80;
          respectThresh = 0;
        }
        if(fullyAsc)
        {
          primaryCrime = 'Terrorism';
          //backupOp = 'Terrorism';
          backupOp = 'Traffick Illegal Arms';
          //backupOp = 'Territory Warfare';
          //backupOp = 'Vigilante Justice';
          statThresh = 300;
          if(curSize < 12)
            respectThresh = (5 ** (curSize - 2)) / numAscMember;
          else
            respectThresh = (5 ** (curSize - 3)) / (curSize - 2);
        }
        

        //level up if needed
        if(Math.min(mStats.str, mStats.def, mStats.dex, mStats.agi) < statThresh)
        {
          if(mStats.task != 'Train Combat')
            ns.gang.setMemberTask(member, 'Train Combat');
        }
        else
        {
          //vigilante if needed
          if(gangInfo.wantedLevel > wantedThresh)
            ns.gang.setMemberTask(member, 'Vigilante Justice');
          //do crime
          else if(mStats.earnedRespect < respectThresh)
            ns.gang.setMemberTask(member, primaryCrime);
          else
            ns.gang.setMemberTask(member, backupOp);
        }
      }
    }

    //loop delay
    await ns.sleep(10000);
  }
}
