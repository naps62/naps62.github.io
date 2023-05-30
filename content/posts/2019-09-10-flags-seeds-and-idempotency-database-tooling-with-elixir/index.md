+++
title="Flags, Seeds and Idempotency: Database Tooling with Elixir"
slug="flags-seeds-and-idempotency-elixir"
date=2019-02-19

[taxonomies]
tags = ["elixir"]

[extra]
canonical="https://blog.appsignal.com/2019/09/10/flags-seeds-idempotency-elixir.html"
+++

_Note: This post was originally written on [AppSignal's Elixir Alchemy Blog](https://blog.appsignal.com/2019/09/10/flags-seeds-idempotency-elixir.html)_

Today we stir into our cauldron of magic potions and idempotence, and brew some neat Elixir database tooling. We’ll do so by going through my experience of setting up my own.

Coming from Ruby on Rails, one of the things that I’ve seen lacking in the Elixir space when it comes to web applications is the helpful tooling that existed in the ecosystem to deal with databases in production. In this post, we’ll cover some of these and see how we can create similar tools in Elixir.

## Customizing the Workflow When Setting up a Database

Most deployment solutions for Ruby on Rails would handle the setup of the database, tying directly into the way they are configured in the framework. This often included such things as:

- Creating and setting up the initial database
- Running all existing migrations
- Seeding the database
- Continuously running new migrations as they get added in future releases

This was all part of the ecosystem and was often taken for granted. But actually, there’s a lot of work involved in plugging all those things together. And sometimes, assumptions were made that made it difficult to tweak this flow to your particular needs.

What if you have some kind of horizontal scaling on your application and need a more custom way to decide when and how migrations are executed? Or simply, what if you want to customize the order or the way each of these steps is done?

The Ruby way of convention-over-configuration is pretty cool, especially when it comes to being a friendly environment for newcomers. But sometimes, the Elixir approach of explicitness has its benefits as well.

With my latest projects, I ended up with some behavior where the ability to fully customize this workflow came in very handy. This ended up in a way that ensures our database is always in a ready state across deploys and even across database resets. Let’s dive into what we did and learned!

## Running Migrations

As an introduction, let’s first see how migrations can be executed on Elixir. I’ll be using [distillery releases](https://github.com/bitwalker/distillery) to showcase this, but the process is pretty much translatable to any other Elixir/Erlang system.

```elixir
defmodule MyApp.Migrator do
def run do
{:ok, _} = Application.ensure_all_started(:my_app)

path = Application.app_dir(:my_app, "priv/repo/migrations")

Ecto.Migrator.run(MyApp.Repo, path, :up, all: true)
  end
  end
```

The above module provides a function that executes migrations for a particular Repo in our application. Right from the start, we notice that all of this is very easily customizable since it’s pure Elixir code that we can change ourselves. Do you have two repos with different migration directories for each? Do you have an umbrella app with several repos spread across it? All of that can be handled here, according to your application’s needs.

The above function is pretty much the equivalent of `mix ecto.migrate`. But mix tasks aren’t available in Elixir releases, which is why we end up having to write them ourselves.

To run this within our release, we can run this script as a start hook:

```elixir
# rel/pre_start_hooks/10_migrate.sh

$RELEASE_ROOT_DIR/bin/my_app command Elixir.MyApp.Migrator run


# rel/config.exs

# ...

release :my_app do
 # ...

 set(pre_start_hooks: "rel/pre_start_hooks")

 set(
   commands: [
     migrate: "rel/pre_start_hooks/10_migrate.sh"
   ]
 )
end
```

These two additions to our Distillery setup will ensure that the migration function is called every time the application starts (which means, every time we deploy a new version). So migrations will end up running automatically as they’re deployed.

## Seeding Your Database

Now that we have played around with migrations, let’s look into seeding your database. Usually, `mix seed` will be used to insert initial records in your database. These are the records your app needs to function properly before your users get to it.

This task just runs an Elixir script stored in `priv/repo/seeds.exs`. But as we’ve seen, Mix tasks are not available within a release.

Usually, your seeds file will consist of something like this:

```elixir
["user", "admin", "editor"]
|> Enum.each(fn role ->
  MyApp.Role.new(name: role)
  |> MyApp.Repo.insert()
end)

MyApp.User.new(name: "Admin", role: "admin")
|> MyApp.Repo.insert()
```

To set this up within Distillery, I moved this logic into its own compiled module rather than an .exs script:

```elixir
defmodule MyApp.Seeds do
  def run do
    ["user", "admin", "editor"]
    |> Enum.each(fn role ->
      MyApp.Role.new(name: role)
      |> MyApp.Repo.insert()
    end)

    MyApp.User.new(name: "Admin", role: "admin")
    |> MyApp.Repo.insert()
  end
end
```

The `priv/repo/seeds.exs` script still exists, but it just calls the newly created function:

```elixir
# priv/repo/seeds.exs

MyApp.Seeds.run()
```

This way, we’re ready to set it up as a Distillery pre-start hook.

This is usually fine for local development, but if you’re setting this up as a pre-start hook, it means this script will be executed over and over again, after each new deploy. If you’re not careful, you may end up inserting duplicate seed data each time.

One could solve this with some tricks that try and check if seeds were already run (such as setting a flag somewhere in the database and checking for it). But there’s a much more powerful way: Idempotent seeds.

## Idempotent Seeds

Let’s get to the coolest stuff!

> **Idempotence** is the property of certain operations in mathematics and computer science whereby they can be applied multiple times without changing the result beyond the initial application.

In short, an idempotent operation is one that you can harmlessly run multiple times, without fear of ending up with duplicate or accumulated results. For database seeds, ensuring their idempotency means you don’t need to worry about ending up with multiple admin users, for example.

As it turns out, another very useful feature of moving seeds logic into a compiled module is the ability to unit-test them! Which is what I did:

```elixir
defmodule MyApp.SeedsTest do
  use MyApp.DataCase, async: false

  test "creates an admin user" do
    MyApp.Seeds.run()

    assert admin = MyApp.Repo.one(MyApp.User)
    assert admin.role == "admin"
  end

  test "admin user creation is idempotent" do
    MyApp.Seeds.run()
    MyApp.Seeds.run()

    user_count = MyApp.Repo.aggregate(MyApp.User, :count, :id)
    assert user_count == 1
  end
end
```

The first test ensures the seed does what it’s supposed to (in this case, the simple creation of a role in the database). The second one ensures that running the seeds twice doesn’t affect the final result.

In a complex system where your codebase is constantly evolving, and the rest of your team is building features on top of other features, it’s common for someone to accidentally add changes that don’t behave as expected once they go live. It’s easy for a developer on your team to add a few new seeds, forgetting how that will play out in production. Let’s see a more practical example of this.

## Seeding Feature Flags

One feature we rely a lot on is feature flags, which give us the ability to toggle behavior on and off without requiring a new release. In Elixir, I do this using the [FunWithFlags package](https://github.com/tompave/fun_with_flags).

When a new flag is being added to the codebase, its initial value may not be too trivial to introduce. Are we adding a new feature, and therefore the flag should start out as `false`? Or are we wrapping an existing feature around a flag, so that we can later remove or change it, in which case the flag should be `true` by default, so as to preserve behavior?

This may even change between environments. We may want certain flags to be enabled by default on our staging system but disabled in production until we manually enable them.

This requirement ties in nicely with our ability to run seeds for our application in an idempotent way, check it out:

```elixir
defmodule MyApp.FlagsSeeds do
  def run do
    set_flag_if_not_set(:new_disabled_feature, false)
    if System.get_env("ENV_NAME") == "staging" do
      set_flag_if_not_set(:new_staging_feature, true)
    else
      set_flag_if_not_set(:new_staging_feature, false)
    end
  end

  defp set_flag_if_not_set(flag_name, value) do
    {:ok, existing} = FunWithFlags.all_flag_names()

    cond do
      Enum.member?(existing, flag_name) ->
        # flag already exists. skip operation
        nil

      value == true ->
        FunWithFlags.enable(flag_name)

      value == false ->
        FunWithFlags.disable(flag_name)

      true ->
        raise "Invalid flag value"
    end
  end
end
```

With this module, we’re able to programmatically define the initial value of our seeds, which can be dependent on some other factor, such as which environment we’re running in.

The `set_flag_if_not_set/2` function is the materialization of our idempotency requirement. We wouldn’t want a new release to disable a flag that we have already manually enabled, right?

By first checking if the flag already exists, we ensure two things:

This flags module is idempotent since a second run will skip all flags
It only works for unset flags, allowing us to manually set their values when needed, without fear of being overridden
We can get even fancier when testing this:

```elixir
defmodule MyApp.FlagSeedsTest do
  use MyApp.DataCase, async: false

  test "is idempotent" do
    MyApp.FlagSeeds.run()
    current_flags = FunWithFlags.all_flags()

    MyApp.FlagSeeds.run()
    new_flags = FunWithFlags.all_flags()

    assert current_flags == new_flags()
  end

end
```

Now, if I or someone else on my team wrongfully change the seeds file in a way that breaks idempotency, our test suite will catch that before it even reaches a live environment, saving everyone a lot of trouble.

## 👋

I hope you enjoyed this little dive into some of the tooling we built, and that you’ve picked up some things you can use yourself. 👋
