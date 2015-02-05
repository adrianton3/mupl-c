mupl-c
======

*Made Up Programming Language with Continuations* is a simple, educational, scheme-like language.

Try it [here](http://adrianton3.github.io/mupl-c/examples/repl/repl.html)!

*src/ev.js* is a basic interpreter written in CPS<br>
*src/ev-trampolined.js* is the same as the previous except that function calls do not grow the control context<br>
*src/ev-lazy-trampolined.js* is the same as the previous except that bindings are lazy (and computed only when used)

###Language

  + `(+ a b)` addition
  + `(- a b)` subtraction
  + `(if cond then else)` return *then* if *cond* holds otherwise return *else*
  + `(let ((name exp)...) body)` evaluate *exp*, bind its result to *name* and return *body*
  + `(set! var exp body)` set the value of *var* to *exp* and return *body*
  + `(lambda (param...) body)` define an anonymous function
  + `(fun name (param...) body)` define a named function
  + `(callee param...)` call *callee*
  + `(call/cc callee)` call *callee* with the current continuation