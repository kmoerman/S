
const S = x => new Proxy (new parser (x), parser)

module.exports = S

const handler =
  { has (self, key) {
      return true
    }

  , get (self, key) {
      const base = Object.getPrototypeOf(self)
      if (key === Symbol.toPrimitive)
        return () => self.id

      const cap = self.parser.capture(base)
      const right = typeof key === 'symbol' && self.parser.ids.has(key) ? cap : [new native (key)]
      return self.parser.wrap(access, base, right)
    }

  , apply (self, subject, xs) {
      const operation = Object.getPrototypeOf(self)
      const operands = self.parser.unwind(xs).values

      self.parser.stack.pop()
      return self.parser.wrap(application, operation, operands)
    }

  , set (self, key, value) {
      const right = self.parser.unwind(value)
      handler.get(self, key)
      const left = self.parser.stack.pop()
      self.parser.wrap(assign, left, right)
      return true
    }
  }


function parser (expose, options) {
  this.stack = []
  this.ids = new Map ()
  this.options = options

  const self = this
  expose[Symbol.iterator] = function* () { yield* self.stack }
}

Object.setPrototypeOf(parser, handler)

parser.prototype.wrap = function (type, ...xs) {
  const base = new type (...xs)
  const self = Object.setPrototypeOf(() => {}, base)
  self.parser = this
  self.id = Symbol()
  this.ids.set(self.id, base)
  this.stack.push(base)
  return new Proxy (self, type)
}

parser.prototype.capture = function (t) {
  const i = this.stack.lastIndexOf(t)
  if (i === -1)
    return []
  const r = this.stack.slice(i+1)
  this.stack = this.stack.slice(0, i)
  return r
}

parser.prototype.unwind = function (input, stop) {
  const base = input && Object.getPrototypeOf(input)
  if (base instanceof type) {
    if (this.stack[this.stack.length-1] === base) {
      return this.stack.pop()
    }
    else {
      console.log('unstacked element')
    }
  }
  else if (input instanceof Array) {
    const r = Array(input.length)
    for (let i = input.length-1; i >= 0; --i) {
      r[i] = this.unwind(input[i], stop)
    }
    return new array (r)
  }
  else {
    return new native (input)
  }
}

parser.get = function (self, key) {
  if (key === Symbol.unscopables)
    return null

  return self.wrap(token, key)
}

parser.set = function (self, key, value) {
  self.wrap(assign, new token (key), self.unwind(value))
  return true
}


function type (f) {
  Object.setPrototypeOf(f, handler)
  Object.setPrototypeOf(f.prototype, type.prototype)
  return f
}

function token (name) {
  this.name = name
}
type(token)
token.prototype.toString = function () {
  return this.name
}

function application (left, right) {
  this.left = left
  this.right = right
}
type(application)
application.prototype.toString = function () {
  return this.left.toString() + '(' + this.right.map(v => v.toString()).join(', ') + ')'
}

function access (left, right) {
  this.left = left
  this.right = right
}
type(access)
access.prototype.toString = function () {
  return this.left.toString() + '[' + this.right.map(v => v.toString()).join(', ') + ']'
}


function native (value) {
  this.value = value
}
type(native)
native.prototype.toString = function () {
  return typeof this.value === 'string' ? "'" + this.value + "'" : (typeof this.value === 'symbol' ? this.value : this.value.toString())
}

function list (values) {
  this.values = values
}
type(list)
list.prototype.toString = function () {
  return 'L( ' + this.values.map(v => v.toString()).join(', ') + ' )'
}

function array (values) {
  this.values = values
}
type(array)
array.prototype.toString = function () {
  return 'A[ ' + this.values.map(v => v.toString()).join(', ') + ' ]'
}


function assign (left, right) {
  this.left  = left
  this.right = right
}
type(assign)
assign.prototype.toString = function () {
  return this.left.toString() + ' = ' + this.right.toString()
}
