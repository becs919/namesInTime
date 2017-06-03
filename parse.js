const Baby = require('babyparse')
const fs = require('fs')
const path = require('path')
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

let newData = {}

for (let year = 1880; year <= 2016; year++) {
  let namesPath = `./data/json/data${year}.json`
  let json = fs.readFileSync(path.resolve(__dirname, namesPath), 'utf8')
  let names = JSON.parse(json)

  names.data.forEach(item => {
    if (!newData[item.gender]) {
      newData[item.gender] = {}
    }

    if (!newData[item.gender][item.name]) {
      newData[item.gender][item.name] = [{ [item.year]: item.count }]
    } else {
      newData[item.gender][item.name].push({ [item.year]: item.count })
    }
  })
}

let dest = `./data/data.json`
jsonfile.writeFile(dest, newData, function (err) {
  console.error(err)
})

