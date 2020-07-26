+++
title="Typespecs and Behaviours in Elixir"
slug="typespecs-and-behaviours-in-elixir"
date= 2019-10-15
category="elixir"

[extra]
canonical="https://blog.appsignal.com/2019/10/15/behaviours.html"
+++

*Note: This post was originally written on [AppSignal's Elixir Alchemy Blog](https://blog.appsignal.com/2019/10/15/behaviours.html)*

Today2, we will dive into Typespecs and Behaviours. These are two Elixir features that we are ecstatic (pun intended) about. They are great examples of built-in features in Elixir that help get some of the advantages of statically typed code.

## Dynamically Typed with Features

Alright, let’s set the scene. Elixir is a dynamically typed language. This means that the type of each variable is not checked at compile-time, but rather at run-time. Like most things, this comes with advantages and disadvantages.

The differences between statically and dynamically typed languages are sometimes the cause of heated debate, and there’s already a lot of material out there. [This post](https://android.jlelse.eu/magic-lies-here-statically-typed-vs-dynamically-typed-languages-d151c7f95e2b) provides a good comparison, and [Chris Smith’s article](https://blog.steveklabnik.com/posts/2010-07-17-what-to-know-before-debating-type-systems) is also a great dive into some of the fallacies that come when discussing type systems.

Despite being dynamically-typed, Elixir does a pretty good job of providing some opt-in features to get some of the safety of statically typed languages. This is important because those features often provide important guarantees about your code. This is usually done by performing static analysis on your code and, with the help of the type system, catch mistakes early on.

The two main examples of this are Typespecs and Behaviours.

### Typespecs

[Typespecs](https://hexdocs.pm/elixir/typespecs.html) is an opt-in feature of Elixir that lets you annotate your functions to provide hints to the language as to what your function headers should look like. Like this:

```elixir
defmodule Foo do
  @spec bar(arg :: binary) :: number
  def bar(arg) do
    String.length(arg)
  end
end
```

The `@spec` keyword lets you specify what the argument names and types should be, as well as the return type.

This doesn’t cause any kind of compilation failure if the types don’t match (again, Elixir is dynamically typed, so the types aren’t actually enforced at compile-time). But it has two other main benefits:

1. It allows for other tools to be built, which will perform static analysis on the code, and use these annotations to inform you if something looks wrong. [dialyxir](https://github.com/jeremyjh/dialyxir) is a popular tool for this;
2. It serves as documentation so that anyone looking at your public API can clearly see what to expect.

Elixir provides a set of basic types that you can use in these specifications. `binary`, `pid` and `number` are some of them (check the [official docs](https://elixir-lang.org/getting-started/basic-types.html) for more on this). But it also allows you to compose these basic types into more complex, custom ones, using the `@type` directive:

### Behaviours

Alright, now we take it to the next level and discuss behaviours. You can think of Behaviours as a kind of interface specification, like what you usually get in object-oriented languages.

Behaviours allow you to specify a contract for your modules and force them to respond to a specific API. This allows you to decouple features, using adapter patterns and other such programming techniques to piece together your code.

The upper layers of an application don’t really need to care if data is persisted into PostgreSQL, MongoDB, or some other database. That’s because Ecto provides a common language (API) to interact with adapters for these storage backends.

A behaviour specifies a list of function headers, here called callbacks. Any other Elixir module which claims to implement said behaviour will have to define those callbacks and their implementation. If one is missing, a compiler warning will be issued, letting the programmer know something’s wrong.

An example behaviour might look something like this:

```
defmodule MyApp.Language do
  @callback greet(name :: binary) :: binary
  @callback thank :: binary
end
```

This behaviour defines two function headers. These are defined just like you would a typespec, except that `@callback` is used, instead of `@spec`.

Now we can write some implementations of our language behaviour:

```
defmodule MyApp.English do
  def greet(name), do: "Hello, #{name}"
  def thank, do: "Thank you"
end

defmodule MyApp.Portuguese do
  def greet(_name), do: "TODO"
  def thank, do: "Obrigado"
end

defmodule MyApp.Japanese do
  def greet, do: "TODO"
  def thank, do: "TODO"
end
```

This last implementation will throw a warning because we’re failing to fulfill the contract. `greet` should actually take an argument. And even if we don’t use it, we still need to expect it. `greet/0` and `greet/1` would be two different functions in Elixir, and the behaviour expects the latter.

```
warning: function greet/1 required by behaviour MyApp.Language is not implemented (in module MyApp.Japanese)
  test.ex:20
```

Note that this is not a compilation failure, just a warning. These annotations are only meant to guide your development and warn you of *potential* mistakes. It’s up to you to know what to do with them.

But before looking into a real-life example of this, we need to discuss a pattern that is commonly associated with behaviours and interfaces…

## The Adapter Pattern

The Adapter pattern is a well-known software development pattern, described in detail by the [Gang of Four’s book on the subject](https://www.goodreads.com/book/show/85009.Design_Patterns). In short, it’s about building public interfaces within your code, such that pieces can be swapped with other functionally-equivalent pieces while keeping everything compatible.

There are two main benefits to this:

1. It promotes decoupling. By enforcing that modules only talk with other modules via the specified interfaces, it doesn’t matter what the underlying implementation is. As long as that part remains stable, inner refactors of your code can be made with a lot more confidence that compatibility won’t be broken
2. It makes it easy to switch between multiple options. Ecto, as mentioned above, is a great example of this. While writing queries with it, you don’t really care if your backend is PostgreSQL, MongoDB, or something else. Ecto’s query language remains the same, and each adapter takes care of translating that to its own language.

As you may guess by now, the go-to way of creating adapters in Elixir is by using behaviours.

## An Example Project

To demonstrate the usefulness of behaviours, I’ll take advantage of a real project for which I contributed.

`fun_with_flags` is an awesome Elixir library for dealing with feature flags. It’s also one of the better-named projects out there

Within my projects, I often felt the need to make feature flags known to my unit tests. Perhaps I’m writing tests to a disabled feature that hasn’t gone live yet, and therefore need to enable it in those tests, to trigger the correct code paths. Or perhaps I want to test how the program responds to different flag values (e.g.: rolling releases).

Either way, I want the ability to enable/disable flags in tests. But the two existing adapters pose limitations to this. Spinning a Redis instance for my test suite seems too much. And using PostgreSQL would require setting up Ecto Sandbox, and giving up on `async: true` completely for any related tests.

The ideal scenario was to have all this run in memory. Which we can, thanks to the adapter pattern that was chosen.

## An InMemory Adapter

And here we go. Everything folded together.

The bulk of the work is to create a module that implements the [`FunWithFlags.Store.Persistent`](https://github.com/tompave/fun_with_flags/blob/67025a436e64795d78183024dc68e5022cd490ff/lib/fun_with_flags/store/persistent.ex) behaviour. All functions listed in the behaviour (`worker_spec/0`, `get/1`, `put/1`, `delete/1`, `all_flags/0` and `all_flag_names/1`) need to be implemented in our adapter.

```elixir
defmodule FunWithFlags.Store.Persistent.InMemory do
  @behaviour FunWithFlags.Store.Persistent
  # ...

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: opts: __MODULE__)
  end

  def init(_), do: {:ok, []}

  def get(flag_name) do
    GenServer.call(__MODULE__, {:get, flag_name})
  end

  def put(flag_name, gate) do
    GenServer.call(__MODULE__, {:put, flag_name, gate})
  end

  # ...

  def handle_call({:get, flag_name}, _from, state) do
    # ...
    # search for the given flag in the state, and return it's status
  end

  def handle_call({:put, flag_name, gate}, _from, state) do
    # ...
    # insert the given gate into the current state
  end

  # ...
end
```

This part of the implementation shows how the `get/1` and `put/1` functions are hooked up. The module is a GenServer to allow it to store and retrieve data without having to persist it to a database.

Note that I avoided displaying the actual implementation of the various `handle_call/3` functions because they’re rather bulky and already beside the point of this post. But the good news is, this is actually published as a hex package, and you can check it out on [Github](https://github.com/naps62/fun_with_flags_in_memory) too!

## Summary

Now we’ve gone all the way into the rabbit hole of this post, from theory to practice. From TypeSpecs, and how behaviours are a cool implementation of Adapter patterns in Elixir to the real-life example. We even got out at the other end on our best behaviour ;-)
