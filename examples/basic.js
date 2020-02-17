
const S = require('../main.js')

with (S(exports)) {

  f(x,y)

  g[x,y,z]

  h[a,b](i(), 0, j())

  l = m(n, o)

}

for (const x of exports)
  console.log(x.toString())
