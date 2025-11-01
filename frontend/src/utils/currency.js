import api from './api'

let cachedRates = null

export async function fetchRates(){
  if (cachedRates) return cachedRates
  const r = await api.get('/external/market/rates')
  cachedRates = r.data
  return cachedRates
}

// Convert from USD to target using fetched rates
export async function convertAmount(amount, to='USD'){
  try{
    const ratesObj = await fetchRates()
    if (!ratesObj || !ratesObj.rates) return amount
    if (to === 'USD') return amount
    const rate = ratesObj.rates[to]
    if (!rate) return amount
    return amount * rate
  }catch(err){
    console.error('convert error', err)
    return amount
  }
}