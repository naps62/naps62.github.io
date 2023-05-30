+++
title="Metaprogramming: From C Preprocessing to Elixir Macros"
slug="metaprogramming-from-c-to-elixir"
date=2019-02-19
category="elixir"

[taxonomies]
tags = ["elixir"]

[extra]
canonical="https://blog.appsignal.com/2019/07/16/elixir-alchemy-metaprogramming.html"
+++

_Note: This post was originally written on [AppSignal's Elixir Alchemy Blog](https://blog.appsignal.com/2019/07/16/elixir-alchemy-metaprogramming.html)_

Developers have a love-hate relationship with metaprogramming. On the one hand, it’s a powerful tool to build reusable code. On the other hand, it can quickly become hard to understand and maintain.

I like to think of it as salt. It’s pretty handy on many occasions, but use just a little too much of it, and you’re left with an unenjoyable dish.

Also, large doses of either of them can lead to increased blood pressure. 😅

However, metaprogramming has come a long way since it’s early days. While I still try not to overuse it, it’s become more useful and easy to work with. Let’s see how it evolved.

## C/C++

If we go back a few decades, to a time when programming languages were more close to the metal, the C/C++ preprocessor was one of the only options we had to do something close to metaprogramming.

This preprocessor was literally what the name suggests: A parser that would run through C code, and process specific definitions (keywords such as `#define` and `#if`), and would output a final version of the C code to the compiler. This final version could change based on some criteria. It would look something like this:

```elixir
#define FOO 1

#if FOO == 1
#define MSG "Hello, World"
#else
#define MSG "Goodbye, World"
#endif

#include <stdio.h>

int main() {
  printf(MSG);
end
```

This program would print `"Hello, World"`, always. As you may guess, changing the FOO definition to 0, and re-compiling the program, would instead cause it to print `"Goodbye, World"` instead.

These preprocessor directives would often be used to create code targeting specific platforms or architectures. For example, you could set different behaviors for your program when compiled to target Windows systems than when targeting Linux systems. The two resulting binaries would have only the code that was relevant to that specific platform, and thus wouldn’t need to perform runtime checks for these conditions. These savings in storage and runtime performance could often be significant.

However, if you have any C experience at all, you know how dangerous it is just in vanilla form. Now add a lot of preprocessing behavior on top of that, and it quickly becomes quite hard to manage. So it wouldn’t be advisable to use it for much more than small configurations, most of the time.

## Ruby

With better technology and higher-level scripting languages, also came the possibility of creating more elaborate styles of programming. Particularly in Ruby, metaprogramming proved to be a powerful, yet scary feature.

The way this works in Ruby is based on the idea that code is nothing more than a string of text, interpreted and executed by the Ruby environment.

Since Ruby is interpreted at runtime, there’s no requirement of having the entire codebase compiled upfront. Ruby allows you to dynamically define instance methods on classes.

Also, due to the way Ruby classes and instances are constructed internally, you can even define methods for individual instances rather than the entire class!

PS: Further reading on Ruby Classes [here](https://www.devalot.com/articles/2008/09/ruby-singleton).

```ruby
class Foo
  def hello1
    puts "Hello from a regular method"
  end

  [:hello2, :hello3].each do |f|
    define_method f do
      puts "Hello from a dynamically-defined #{f} method"
    end
  end
end

foo = Foo.new

foo.define_singleton_method(:hello4) { puts "Hello only from this instance of Foo" }

foo.hello1
foo.hello2
foo.hello3
foo.hello4
```

Ruby is also pretty lax when it comes to editing existing code, even from the standard library. This is valid Ruby:

```ruby
array = [1, 2, 3]

# will print out 3
puts array.size

class Array
  def size
    "Hello"
  end
end

# will now print out "Hello"
puts array.size
```

Don’t to that, though! It will most likely break your program and is a bad practice overall.

Last but not least, Ruby has some powerful ways of handling unexpected function calls, such as the `method_missing` callback:

```ruby
array = [1, 2, 3]

class Array
  def method_missing(method, *args)
    puts "#{method} method not found"

    if method == :sise then
      puts "Did you intend to type size instead?"
    end
  end
end

puts array.sise
```

Overall, these abilities were a big game-changer for me when I first learned about them. It enabled me to think about my codebase in a whole new different way and improve it in the process.

There were some issues, though. You know what they say: with great power comes great responsibility.

Several Ruby libraries used and abused these metaprogramming mechanisms to create their own Domain Specific Languages. In the long run, this overuse would result in similar problems as we had in C++ times: difficulty maintaining and understanding a codebase.

Elixir took, in my opinion, yet another step forward in the right direction here…

## Elixir ❤️

Here, metaprogramming is built into the language’s core in a much more powerful way. Whereas Ruby allowed you to define methods dynamically, or event generate a string and evaluate it as code (the old `eval` method that we all hate), Elixir allows you to mess with the Abstract Syntax Tree (AST) itself.

This is done through the `quote` keyword:

```elixir
iex> expr = quote do
  "Hello, " <> "World"
end
```

Trying out the above code, you’ll find that the string concat operation doesn’t get executed directly. Instead of a final string, you end up with an AST expression that describes your code:

```elixir
{:<>, [context: Elixir, import: Kernel], ["Hello, ", "World"]}
```

Those familiar with [Polish Notation](https://en.wikipedia.org/wiki/Polish_notation) may quickly identify that this is equivalent to the string concatenation code from above. So by quoting some code, you get an AST description of that code, which you can then use across the rest of your codebase.

You can then start to reason about your code as if it were a data structure (which it is… an AST), and perform operations to transform it:

Let’s modify things a little bit:

```elixir
iex> expr = quote do
  "Hello, " <> name
end
```

Now our expression uses a dynamic name instead. However, where does that name come from? We don’t have that variable defined anywhere, but it is still syntactically correct:

```elixir
{:<>, [context: Elixir, import: Kernel], ["Hello, ", {:name, [], Elixir}]}
```

However, it will fail to execute, which we can test by using `Code.eval_quoted/3`:

```elixir
iex> Code.eval_quoted(expr)
** (CompileError) nofile:1: undefined function name/0
    (elixir) lib/code.ex:590: Code.eval_quoted/3
    test.ex:5: (file)
```

Let’s now create a second AST definition:

```elixir
definition = quote do
  name = "Miguel"
end
```

This second expression definition defines a variable called `name`. However, remember, we’re not defining any value, just creating the AST for that operation.

We can combine these two expressions into a single one:

```elixir
final_code = quote do
  unquote(definition)
  unquote(expr)
end
```

This ends up having the same result as if we had typed:

```elixir
name = "Miguel"
"Hello, " <> name
```

However, notice we never had to abandon the Elixir syntax and rules while doing so. We’re writing Elixir that writes Elixir!

This is heavily used internally within Elixir’s core. Whenever you define a function, or a simple if statement, you’re executing macros that change the code’s AST according to fit your code into them. Speaking of which…

## Elixir’s Macros

Much of Elixir’s features are written with macros. Many of the common operators you use can be rewritten with macros. Let’s take, for instance, the `unless` operator (which already exists in the language’s core) and define it ourselves:

```elixir
defmodule Foo do
  defmacro custom_unless(condition, do: do_clause, else: else_clause) do quote do
      if !unquote(condition) do
        unquote(do_clause)
      else
        unquote(else_clause)
      end
    end
  end

  defmacro custom_unless(condition, do: do_clause) do
    quote do
      Foo.custom_unless(unquote(condition), do: unquote(do_clause), else: nil)
    end
  end
end

defmodule Bar do
  require Foo

  Foo.custom_unless true, do: IO.puts("not true"), else: IO.puts("true")
end
```

Our `custom_unless` macro take in a boolean value. Inside, we check for the opposite of the condition (we run whatever code AST was given on that condition, and invert the resulting boolean). Then we execute the AST given for either the `do` or the else clause, depending on the result.

However, the fun part about Elixir is that, since even the basic constructs such as `if` clauses are often built using macros themselves, we can better embed our macros in the language. In other words, after defining our macro, this is also working Elixir code:

```elixir
defmodule Bar
  # importing instead of requiring allows us to call the macro directly,
  # without the Foo. prefix
  import Foo

  custom_unless true do
    IO.puts("not true")
  else
    IO.puts("true")
  end
end
```

This works because the interpretation of a multiline `if`/`else` block in Elixir is not much more than syntactic sugar for:

```elixir
if condition do: something, else: something_else
```

## Conclusion

Hopefully, this has been a useful walkthrough of how macros evolved in the past, especially for Elixir developers that may not know the full power of their language, as well as the history.
