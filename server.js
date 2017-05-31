const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const Promise = require('bluebird');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = 'NamesInTime';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (request, response ) => {
  fs.readFile(`${__dirname}/index.html`, (err, file) => {
    response.send(file)
  })
});

app.get('/api/v1/names', (request, response) => {
  const year = request.query.year
  const name = request.query.name
  if (!year && !name) {
    database('names').select().limit(10)
    .then(name => response.status(200).json(name))
    .catch((error) => {
      response.status(404).send('no names', error);
    });
  } else if (year && !name) {
    database('years').where('year', year).select('id')
      .then(row => {
        return database('junction').where('year_id', row[0].id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
      })
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        console.log(error);
        response.status(404).json(error);
      })
  } else if (name && !year) {
    database('names').where('name', name).select('id')
      .then(names => {
        const namesArr = names.map(name => {
          return database('junction').where('name_id', name.id).select('count').limit(10)
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(namesArr)
      })
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        console.log(error);
        response.status(404).json(error);
      })
  } else if (name && year) {
    // let subquery = database('years').where('year', year).select('id', 'year');
    // console.log(subquery);
    // let subquery2 = database('names').where('name', name).select('id', 'name', 'gender');
    // console.log('subquery2',subquery2);
    // database('junction').where('year_id', 'in', subquery).andWhere('name_id', 'in', subquery2).select('count', 'name_id', 'year_id')
    //
    //   .join('names', 'names.id', '=', subquery2).select('names.name', 'names.gender')
    //   .join('years', 'junction.year_id', '=', subquery).select('year')
    //   .then(rows => {
    //     console.log(rows);
    //   }).catch((err) => console.log(err))

    let yearId
    database('years').where('year', year).select('id')
      .then((year) => {
        yearId = year[0].id
        return database('names').where('name', name).select('id')
      })
      .then((names) => {
        return Promise.map(names, (name) => {
          return database('junction').where('year_id', yearId).andWhere('name_id', name.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year');
        })
      })
      .then(rows => {
        let filtered = rows.filter(row => {
          return row.length > 0;
        })
        response.status(200).json(filtered)
      }).catch(error => {
        response.status(500).json(error)
      })
  }
});

app.get('/api/v1/names/:id', (request, response) => {
  database('names').where('id', request.params.id).select()
    .then(name => response.status(200).json(name))
    .catch((error) => {
      response.status(404).send('no names', error);
    });
});


app.post('/api/v1/names', (request, response) => {
  let nameId
  const {name, gender, count, year} = request.body;
  database.transaction(trx => {
    return trx('names').insert({name, gender}, 'id')
    .then((ids) => {
      nameId = ids[0]
      return trx('years').where('year', year).select('id')
    })
    .then((years) => {
      if(!years.length){
        return trx('years').insert({year}, 'id')
      } else {
        return Promise.resolve([years.id])
      }
    })
    .then((ids) => {
      return trx('junction').insert({'year_id': ids[0], 'name_id': nameId, count})
    })
  })
  .then(() => {
    response.status(200).json('successful')
  })
  .catch(error => {
    response.status(404).json(error)
  })
});


// app.get('/api/v1/names', (request, response) => {
//   database('names').where('id', request.params.id).select()
//     .then(name => response.status(200).json(name))
//     .catch((error) => {
//       response.status(404).send('no names', error);
//       response.status(500).send({ 'server error': error });
//     });
// });


// app.get('/api/v1/products', (request, response) => {
//   const brand = request.query.brand;
//   if (!brand) {
//     database('nailPolish').select()
//     .then((products) => {
//       response.status(200).json(products);
//     })
//     .catch((error) => {
//       response.status(404).send('no brands', error);
//       response.status(500).send({ 'error: ': error });
//     });
//   } else if (brand) {
//     database('brands').where('brand', brand).first()
//     .then((searchBrand) => {
//       if (!searchBrand) {
//         response.status(404).send({ error: 'No polish found for this brand' });
//       } else {
//         database('nailPolish').where('brand_id', searchBrand.id)
//         .then((products) => {
//           response.status(200).json(products);
//         });
//       }
//     })
//     .catch((error) => {
//       response.status(404).send('no brands', error);
//       response.status(500).send({ 'error: ': error });
//     });
//   }
// });
//
// app.get('/api/v1/brands/:id', (request, response) => {
//   database('brands').where('id', request.params.id).select()
//   .then((brand) => {
//     response.status(200).json(brand);
//   })
//   .catch(() => {
//     response.status(404).send('no brand matching that id');
//   });
// });
//
// app.patch('/api/v1/brands/:id', checkAuth, (request, response) => {
//   const name = request.body.brand;
//
//   if (!name) {
//     response.status(404).send('not found');
//   } else {
//     database('brands').where('id', request.params.id).update({ brand: name })
//     .then(() => {
//       response.status(200).send('updated');
//     })
//     .catch(() => {
//       response.status(422).send('not updated');
//     });
//   }
// });
//
// app.patch('/api/v1/products/:id', checkAuth, (request, response) => {
//   const name = request.body.name;
//   const price = request.body.price;
//   const rating = request.body.rating;
//
//   database('nailPolish').where('id', request.params.id).update({ name, price, rating })
//   .then(() => {
//     response.status(200).send('updated');
//   })
//   .catch(() => {
//     response.status(422).send('not updated');
//   });
// });
//
// app.get('/api/v1/products/:id', (request, response) => {
//   database('nailPolish').where('id', request.params.id).select()
//   .then((product) => {
//     response.status(200).json(product);
//   })
//   .catch(() => {
//     response.status(404).send('no product matching that id');
//   });
// });
//
// app.post('/api/v1/brands', checkAuth, (request, response) => {
//   const brandName = request.body.brand;
//
//   if (!brandName) {
//     response.status(422).send({ error: 'You are missing data' });
//   } else {
//     database('brands').insert({ id: Math.floor(Math.random() * (500 - 30)) + 30, brand: brandName })
//     .then(() => {
//       response.status(201).json({ brandName });
//     })
//       .catch((error) => {
//         response.status(404).send({ 'error: ': error });
//         response.status(500).send({ 'error: ': error });
//       });
//   }
// });
//
// app.post('/api/v1/products/brands/:id', checkAuth, (request, response) => {
//   const name = request.body.name;
//   const price = request.body.price;
//   const rating = request.body.rating;
//   const brandId = request.params.id;
//
//   database('brands').where('id', request.params.id).select()
//   .then(() => {
//     if (!name) {
//       response.status(422).send({ error: 'You are missing data!' });
//     } else if (!price) {
//       response.status(422).send({ error: 'You are missing data!' });
//     } else if (!rating) {
//       response.status(422).send({ error: 'You are missing data!' });
//     } else {
//       database('nailPolish').insert({ brand_id: brandId, name, price, rating })
//       .then(() => {
//         response.status(201).json({ brand_id: brandId, name, price, rating });
//       })
//       .catch(() => {
//         response.status(404).send('no matching brand');
//       });
//     }
//   });
// });
//
// app.delete('/api/v1/products/:id', checkAuth, (request, response) => {
//   database('nailPolish').where('id', request.params.id).delete()
//   .then(() => {
//     response.sendStatus(204);
//   })
//   .catch(() => {
//     response.status(404).send('nothing deleted');
//   });
// });
//
// app.delete('/api/v1/brands/:id', checkAuth, (request, response) => {
//   database('nailPolish').where('brand_id', request.params.id).update({ brand_id: null })
//   .then(() => {
//     return database('brands').where('id', request.params.id).delete();
//   })
//   .then(() => {
//     response.status(204).send('deleted');
//   })
//   .catch(() => {
//     response.status(404).send('nothing deleted');
//   });
// });

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`)
  });
}

module.exports = app;
