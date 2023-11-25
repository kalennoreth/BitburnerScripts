/** @param {NS} ns */
export async function main(ns)
{
  let stocks = ns.stock.getSymbols();
  
  for(let curStock of stocks)
  {
    let curHoldings = ns.stock.getPosition(curStock)[0];
    ns.stock.sellStock(curStock, curHoldings)
  }
}
