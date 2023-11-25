/** @param {NS} ns */
export async function main(ns)
{
  //This code finds the path from 'home' to the server named in its argument and prints the path to the terminal
  
  //Get target arg
  let target = ns.args[0];

  //Initialize server structure
  let nodes = ['home'];
  var nodeParents = {};
  for(let nodeInd = 0; nodeInd < nodes.length; nodeInd++)
  {
    let subNodes = ns.scan(nodes[nodeInd]);
    for(let subInd = 0; subInd < subNodes.length; subInd++)
    {
      if(!nodes.includes(subNodes[subInd]))
      {
        nodes.push(subNodes[subInd]);
        nodeParents[subNodes[subInd]] = nodes[nodeInd];
      }
    }
  }
  
  let curServer = target
  let path = [];
  while(curServer != 'home')
  {
    path.push(curServer);
    curServer = nodeParents[curServer];
  }
  path.reverse();

  ns.tprint(path);
}
