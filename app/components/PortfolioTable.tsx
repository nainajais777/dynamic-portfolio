'use client';
import {useEffect,useState} from 'react';
interface Stock
{
    sector :string;
    particulars:string;
    purchasePrice?:number;
    qty?:number;
    investment?:number;
    cmp?:number;
    presentValue?:number;
    gainLoss?:number;
    peRatio?:number| string|null;
    latest?:string | number | null;
    portfolioPercent?:number;
    symbol?:string | null;
    error?:string|null;
    
}
interface SectorSummary
{
    [key:string] :
    {
        totalInvestment :number;
        totalPresentValue: number;
        totalGainLoss:number;
    };
}

export default function PorfolioTable()
{
    const [data,setData] =useState<Stock[]>([]);
    const [sectorSummary,setSectorSummary]=useState<SectorSummary>({});
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState<string | null>(null);

useEffect(()=> {
    const fetchData =() => {
fetch('http://localhost:4035/portfolio')
  .then((res)=>{
    console.log("Raw response",res);
    if(!res.ok)
        throw new Error(`API error ${res.status}`);
    return res.json();
  })
   .then((json)=>
    {
      console.log("API full json",json);
      console.log("Backend fetched Result",json.results);
      console.log("Sector summary",json.sectorSummary);
    
      setData(json.results || []);
      setSectorSummary(json.sectorSummary || {} );
      setLoading(false);
      setError(null);


    })
    .catch((err) =>
    {
        console.error("Error fetching data",err);
        setError(String(err));
        setLoading(false);
    
    });
};
fetchData();
const interval=setInterval(fetchData,15000); //refresh after 15 sec
return() => clearInterval(interval);
},[]); //end of useefect

 if (loading) return <div className="text-center mt-10">Loading portfolio...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

  // Group by sector
  const grouped = data.reduce((acc, stock) => {
    const s = stock.sector || 'Uncategorized';

    if (!acc[s]) acc[s] = [];
    acc[s].push(stock);
    return acc;
  }, {} as Record<string, Stock[]>);

  console.log("🟩 Grouped sector data:", grouped);
  
  return (
     <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Dynamic PorfolioTable</h1>
    {Object.keys(grouped).map((sector) => (
     <div key={sector} className='mb-8 bg-white rounded-lg shadow p-4'>
      <h2 className="text-xl mb-2 text-blue-700">{sector}</h2>
      <table className='min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm'>
        <thead className="bg-gray-100">
          <tr className='text-center'>
                <th className='border px-4 py-2'>Particulars</th>
                <th className='border px-4 py-2'>Purchase Price</th>
                <th className='border px-4 py-2'>Qty</th>
                <th className='border px-4 py-2'>Investment</th>
                <th className='border px-4 py-2'>Portfolio</th>
                <th className='border px-4 py-2'>CMP</th>
                <th className='border px-4 py-2'>Present Value</th>
                <th className='border px-4 py-2'>Gain/Loss</th>
                <th className='border px-4 py-2'>P/E Ratio</th>
                <th className='border px-4 py-2'>Latest</th>               
          </tr>
        </thead>
        <tbody>
          {grouped[sector].map((stock,i)=>
            {
              console.log("Rendering Stock Row",stock);
              return(
                <tr key={`${stock.symbol ?? stock.particulars}-${i}`} className="text-center">
                <td className='border px-4 py-2'>{stock.particulars} </td>
                <td className='border px-4 py-2'>
                {stock.purchasePrice!=null ? stock.purchasePrice.toFixed(2): '-'}
                </td> 
                <td className='border px-4 py-2'>
                  {stock.qty ?? '-'}
                </td>
                <td className='border px-4 py-2'> 
                     {stock.investment != null ? stock.investment.toFixed(2) : '-'}
                </td>
                <td className='border px-4 py-2'>
                      {
                        stock.portfolioPercent!=null ? stock.portfolioPercent.toFixed(2) + '%' : '-'
                      }
                </td>
                <td className='border px-4 py-2'>
                  {
                    stock.cmp!=null ? stock.cmp.toFixed(2) : '-'
                  }
                </td >

                <td className='border px-4 py-2'>
                 {
                 stock.presentValue!=null  ? stock.presentValue.toFixed(2) : '-'
                 }
                </td>  
                 <td className={`border px-4 py-2 
                  ${(stock.gainLoss ?? 0) > 0 ?'text-green-600' :'text-red-500'
                  }`} >
                  {
                    stock.gainLoss!=null ?stock.gainLoss.toFixed(2) : '-'
                  }  
                 </td>
                 <td className='border px-4 py-2'>
                  {
                    stock.peRatio!=null ? String(stock.peRatio) : '-'
                  }
                 </td>
                 <td className='border px-4 py-2'>
                

                  {
                  stock.latest != null && !isNaN(Number(stock.latest))
                  ? Number(stock.latest).toFixed(2)
                   : '-'}
                  
                 </td>
                </tr>
              );
            }          
          )} {/*end of grouped[sector] */}
            {/* Sector total row */}
              {sectorSummary[sector] && (
                <tr className="font-semibold bg-blue-50">
                  <td colSpan={3} className="border px-4 py-2 text-right">
                    Total
                  </td>
                  <td className="border px-4 py-2">
                    {sectorSummary[sector].totalInvestment.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2">—</td>
                  <td className="border px-4 py-2">—</td>
                  <td className="border px-4 py-2">
                    {sectorSummary[sector].totalPresentValue.toFixed(2)}
                  </td>
                  <td
                    className={`border px-4 py-2 ${
                      sectorSummary[sector].totalGainLoss > 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {sectorSummary[sector].totalGainLoss.toFixed(2)}
                  </td>
                  <td colSpan={2} className="border px-4 py-2 text-center">
                    Sector Summary
                  </td>
                </tr>
              )}
        </tbody>
      </table>
    </div>

     ))} {/*end of objet.keys */}
     </div>
     
  ); //end of return



}//end of portfoliotable