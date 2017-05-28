const Baby = require('babyparse')
const fs = require('fs')
var jsonfile = require('jsonfile')
jsonfile.spaces = 2

for (let year = 1880; year <= 2016; year++) {
  fs.readFile(`./data/csv/yob${year}.txt`, 'utf8', (err, data) => {
    if (err) {
      throw err
    }

    const parsed = Baby.parse(data, { header: true, skipEmptyLines: true })

    let dataArray = parsed.data
    let newDataArray = dataArray.map(item => {
      return Object.assign(item, { year, count: parseInt(item.count) })
    })

    parsed.data = newDataArray
    let dest = `data/json/data${year}.json`
    jsonfile.writeFile(dest, parsed, function (err) {
      console.error(err)
    })
  })
}
