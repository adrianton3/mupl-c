mupl-c
======

*Made Up Programming Language with continuations* is a simple, educational, scheme-like language.

Try it [here](http://madflame991.github.io/mupl-c/examples/repl/repl.html)!

###Syntax

    Exp -> _number 
      | _identifier 
      | ( + Exp Exp )
      | ( - Exp Exp )
      | ( if Exp Exp Exp )
      | ( let _identifier Exp Exp Exp )
      | ( set! _identifier Exp Exp Exp )
      | ( lambda _identifier Exp )
      | ( fun _identifier _identifier Exp )
      | ( call Exp Exp )
      | ( call/cc Exp )