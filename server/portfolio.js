import express from "express";
import cors from "cors";
import YahooFinance from "yahoo-finance2";
import excelToJson from "convert-excel-to-json";
const app =express();
app.use(cors());
function getYahooSymbol(nseBse) {
  if (!nseBse || nseBse === "#N/A") return null;

  // Already NSE ticker
  if (typeof nseBse === "string" && /^[A-Z]+$/.test(nseBse)) {
    return `${nseBse}.NS`;
  }

  // BSE code - convert to NSE
  if (typeof nseBse === "number" || /^\d+$/.test(String(nseBse))) {
    const mapped = BSE_TO_NSE[parseInt(nseBse)];
    return mapped ? `${mapped}.NS` : null;
  }

  return null;
}


const yahooFinance= new  YahooFinance();

const BSE_TO_NSE = {
  532174: "ICICIBANK",
  544252: "BAJAJHFL",
  511577: "SAVANIFIN",
  542651: "KPITTECH",
  544028: "TATATECH",
  544107: "BLSE",
  532790: "TANLA",
  532540: "TATACONSUM",
  500331: "PIDILITIND",
  500400: "TATAPOWER",
  542323: "KPIGREEN",
  532667: "SUZLON",
  542851: "GENSOL",
  543517: "HARIOMPIPE",
  542652: "POLYCAB",
  543318: "CLEAN",
  506401: "DEEPAKNTR",
  541557: "FINEORG",
  533282: "GRAVITA",
  540719: "SBILIFE",
  500209: "INFY",
  543237: "HAPPSTMNDS",
  543272: "EASEMYTRIP",
};

const filePath="/home/naina/Downloads/sample.xlsx";
app.get("/portfolio",async(req,res)=>
{
  try 
  {
  const result=excelToJson({
     sourceFile : filePath,
     header:{rows:2},
     columnToKey:
     {
        B:"particulars",
        C:"purchasePrice",
        D:"qty",
        E:"investment",
        G:"nseBse",
        H:"CMP",
        I:"presentValue",
        J:"gainLoss",
        M:"peRatio",
        N:"latest",
     },
  });
  console.log(`result of excel to json which include sheetname named as key :  ${JSON.stringify(result,null,2)}`);
  const excelData = result[Object.keys(result)[0]] || [];
console.log(`excelData ${JSON.stringify(excelData,null,2)}`);

let currentSector = "";
const stocksList=excelData.map((row)=> 
{
    if(row.particulars && String(row.particulars).toLowerCase().includes("sector"))
    {
    currentSector=String(row.particulars).trim();
    console.log(`currentSector : ${currentSector,null,2}`);
    return null;
    }

    if(row.particulars && row.nseBse)
    {
    const s ={
            sector: currentSector || "Uncategorized",
            particulars: row.particulars,
            nseBse: row.nseBse,
            purchasePrice: Number(row.purchasePrice) || 0,
            qty: Number(row.qty) || 0,
            investment: Number(row.investment) || 0,
            excelCMP: Number(row.CMP) || null,
            excelPE: Number(row.peRatio) || null,
            excelEarnings: row.latest || null,
        };
        console.log(`value of s ${JSON.stringify(s)}`);
        return s;
    }
    return null;
}) //end of stocklist
  .filter(Boolean);
  // Log the final array after filtering
console.log("Final stocksList after filter:", JSON.stringify(stocksList, null, 2));


const results =await Promise.all(
 stocksList.map(async (stock)=>
 {
  const symbol = getYahooSymbol(stock.nseBse);
   console.log("Symbol for", stock.particulars, "=>", symbol);
  if(!symbol)
  {
    return{
       ...stock,
       symbol:null,
       cmp:stock.excelCMP || 0,
       presentValue: (stock.excelCMP || 0) * stock.qty,
       gainLoss :((stock.excelCMP || 0) *stock.qty)-stock.investment,
       peRatio:stock.excelPE,
       latest:stock.excelEarnings,
       error:"Invalid Symbol",
    };
  }

        try {
          // Fetch from Yahoo Finance
          const quote = await yahooFinance.quote(symbol);
          
          const cmp = quote?.regularMarketPrice ?? stock.excelCMP ?? 0;
          const presentValue = cmp * stock.qty;
          const gainLoss = presentValue - stock.investment;

          // Use Yahoo's trailing P/E, fallback to Excel value
          const peRatio = quote?.trailingPE ?? stock.excelPE ?? null;
          
          // Use Yahoo's EPS, fallback to Excel value
          const latest = quote?.epsTrailingTwelveMonths ?? stock.excelEarnings ?? null;

          return {
            sector: stock.sector,
            particulars: stock.particulars,
            symbol,
            purchasePrice: stock.purchasePrice,
            qty: stock.qty,
            investment: parseFloat(stock.investment.toFixed(2)),
            cmp: parseFloat(cmp.toFixed(2)),
            presentValue: parseFloat(presentValue.toFixed(2)),
            gainLoss: parseFloat(gainLoss.toFixed(2)),
            /*peRatio: peRatio ? parseFloat(peRatio.toFixed(2)) : null,
            latest: latest ? parseFloat(latest.toFixed(2)) : null,*/
            peRatio: isNaN(peRatio) ? null : parseFloat(Number(peRatio).toFixed(2)),
            latest: isNaN(latest) ? null : parseFloat(Number(latest).toFixed(2)),

          };
        }
  catch(err)
  {
 console.error(`Error fetching ${symbol} :`,err.message);
         // Fallback to Excel values on error
          const cmp = stock.excelCMP || 0;
          const presentValue = cmp * stock.qty;
          const gainLoss = presentValue - stock.investment;

          return {
            sector: stock.sector,
            particulars: stock.particulars,
            symbol,
            purchasePrice: stock.purchasePrice,
            qty: stock.qty,
            investment: stock.investment,
            cmp,
            presentValue,
            gainLoss,
            peRatio: stock.excelPE,
            latest: stock.excelEarnings,
            error: "Fetch failed",
          };

   }
}) //end of stocklist.map
); //end of results

const sectorSummary ={};
results.forEach((stock) =>
{
  if(!stock.sector) return;
  if(!sectorSummary[stock.sector])
  {
    sectorSummary[stock.sector]=
  {
    totalInvestment:0,
    totalPresentValue:0,
    totalGainLoss:0,

  };
}
 sectorSummary[stock.sector].totalInvestment += stock.investment;
      sectorSummary[stock.sector].totalPresentValue += stock.presentValue;
      sectorSummary[stock.sector].totalGainLoss += stock.gainLoss;

}); //end of result.foreach 

 // Calculate portfolio percentages
    const totalInvestment = results.reduce((sum, s) => sum + s.investment, 0);
    results.forEach((stock) => {
      stock.portfolioPercent = totalInvestment 
        ? parseFloat(((stock.investment / totalInvestment) * 100).toFixed(2))
        : 0;
    });


res.json({results,sectorSummary});
  } //try block of portfolio
  catch(err)
  {
     console.error("Server Error:", err);
    res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
}); //end of portfolio route





app.listen(4035,()=>
{
    console.log("Listening");
});


