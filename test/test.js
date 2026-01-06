import Decimal from "decimal.js";
import numbro from "numbro"

let numberOfString = '5.00E-04'
// const res = Decimal('-1,184.51')
// console.log(res.toString())

let res = numbro.unformat(numberOfString)
console.log(res,typeof res)
