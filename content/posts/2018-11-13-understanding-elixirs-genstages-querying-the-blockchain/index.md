+++
title="Understanding Elixir’s GenStages: Querying the Blockchain"
slug="understanding-elixir-genstage"
date=2018-11-13

[taxonomies]
tags = ["elixir"]

[extra]
canonical="https://blog.appsignal.com/2018/11/13/elixir-alchemy-understanding-elixirs-genstages-querying-the-blockchain.html"
+++

_Note: This post was originally written on [AppSignal's Elixir Alchemy Blog](https://blog.appsignal.com/2018/11/13/elixir-alchemy-understanding-elixirs-genstages-querying-the-blockchain.html)_

In this post, we’ll dive into Elixir’s GenStage module. Along the way, we’ll explain backpressure and we’ll write a Genstage to query the blockchain. Let’s start by discussing how using a GenStage can solve buffering problems.

## What Is a GenStage?

Imagine you’re consuming data from an external source. That source could be anything “streamable” - such as reading a file line-by-line, a table in a database, or even a sequence of requests to a 3rd party API.

In such scenarios, where you need to stream data into your system, and probably do some processing on each data point, it’s common to use a buffer to read in a few items, process the whole batch, and then fetch a new set into the buffer. I remember, from the time I was learning C/C++, that this would be a common, although arguably naive way to do things.

With that approach, you may run into one of two problems: the buffer can get too small, or the buffer van get too large.

1. **Buffer Too Small** This happens if you read too few items at a time. Since you’re switching back and forth between reading and processing items, there will be a performance cost from the task switching. In the example of reading a file, your hardware or Operating System may be reading more data than what you’re actually requesting, resulting in sub-optimal performance, in addition to having to fetch the same part of the file later on.
2. **Buffer Too Large** In this case, you request too much from your data source. You may end up either creating a bottleneck (e.g. having to wait for your hard drive to read everything you requested), or not being able to process all the data in an efficient manner. If you’ve ever heard of a [buffer overflow](https://en.wikipedia.org/wiki/Buffer_overflow) (a common performance and security concern), this is it. You’re reading more than what your system can keep up with, resulting in all kinds of problems, from performance to actual failures.

## The Solution: Backpressure

The term _backpressure_ refers to the behavior of a system that builds up input, then halts the receiving of new data once the buffer is full, resuming it once again when the system is ready to handle it.

This is the core idea behind Elixir’s GenStage.

## GenStage

GenStage is an abstraction built on top of GenServer to provide a simple way to create a Producer/Consumer architecture, while automatically managing the concept of backpressure.

In a GenStage, you create a pipeline of multiple Producers & Consumers. Producers generate data points, or read them from a source, and then pass them down to the pipeline. They can then be sent through one or more Consumers that will do whatever processing you need done.

The idea of backpressure is applied in the way items are created in a Producer. When the pipeline is ready to receive new items, the `handle_demand/2` function of the Producer is called, requesting a specific amount of items.

The amount requested is decided internally (although you can specify a maximum value), and the function is called whenever there is room for them in the pipeline. If items take too long to process, Producers end up being idle for a while, thus relieving some pressure from the system.

## Use Case

As an example of what a GenStage can be useful for, let’s consider reading chunks of data from an external data source. In this case, we’ll use the [Ethereum](https://www.ethereum.org/) blockchain, since it fits this concept nicely.

A blockchain is composed of a series of blocks, each one containing multiple transactions. If we want to process the entire blockchain (for example, to look up all transactions involving a given address, or to listen to it continuously when integrating with your application), a GenStage is a perfect fit.

In this context, each block can be considered as a single data item. Let’s see how this can be achieved.

## Querying the Blockchain

We’re going to use [Infura’s public HTTP API](https://infura.io/) to interact with the Ethereum blockchain. Let’s start by building a wrapper to its interface. I’ll be using the [Tesla library](https://github.com/teamon/tesla) for this (this is just a personal preference, feel free to choose your own).

```elixir
defmodule EthSync.Infura do
  use Tesla

  plug(Tesla.Middleware.BaseUrl, "https://ropsten.infura.io/")

  # encode/decode body as json
  # Infura doesn't set the "content-type" header to "application/json"
  # so we need to tell Tesla that we want text/plain requests to be decoded as well
  plug(Tesla.Middleware.JSON, decode_content_types: ["text/plain; charset=utf-8"])

  @doc "Get an entire block"
  def get_block(number) do
    case call(:eth_getBlockByNumber, [to_hex(number), true]) do
      {:ok, nil} ->
        {:error, :block_not_found}

      error ->
        error
    end
  end

  @doc "Sends a JSON-RPC call to the server"
  defp call(method, params \\ []) do
    case post("", %{jsonrpc: "2.0", id: "call_id", method: method, params: params}) do
      {:ok, %Tesla.Env{status: 200, body: %{"result" => result}}} ->
        {:ok, result}

      {:error, _} = error ->
        error
    end
  end

  @doc "Converts integer values to hex strings"
  def to_hex(decimal), do: "0x" <> Integer.to_string(decimal, 16)
end
```

We’ll only need a single endpoint for this: getting a block’s data, given its index on the chain. The block number must be given in hexadecimal format, so we also need a helper method to handle the conversion.

We can verify that this is working via `iex`:

```elixir
iex(1)> EthSync.Infura.get_block(1)
{:ok,
 %{
   "number" => "0x1",
   "transactions" => [],
   # ...
 }
}

iex(2)> EthSync.Infura.get_block(1_000_000_000_000)
{:error, :block_not_found}
```

## Building the Producer

Our Producer will be a process with the responsibility of fetching Ethereum blocks.

```elixir
defmodule EthSync.Producer2 do
  alias EthSync.Infura
  use GenStage

  def init(_) do
    {:producer, 1}
  end

  def handle_demand(demand, next_block) when demand > 0 do
    IO.puts("Demanding #{demand}")

    blocks =
      next_block..(next_block - 1 + demand)
      |> Enum.map(fn n ->
        IO.puts("Fetching block #{n}")
        Infura.get_block(n)
      end)

    {:noreply, blocks, next_block + length(blocks)}
  end
end
```

## Building the Consumer

The Consumer will receive lists of blocks and then process them. In the example, we’ll use `:timer.sleep/1` to simulate processing time since we’re not doing any actual work. Keep in mind that the list of blocks received is not necessarily the same as what was sent in the Producer. Items can be buffered according to the GenStage’s internal rules. It may also happen that you have multiple Consumers and items get split between them.

```elixir
defmodule EthSync.Consumer do
  alias EthSync.Infura
  use GenStage

  def init(_) do
    {:consumer, nil}
  end

  def handle_events(blocks, _from, state) do
    blocks
    |> Enum.each(fn
      {:ok, %{"number" => n}} ->
        IO.puts("Received block #{n}")
        :timer.sleep(1_000)
    end)

    {:noreply, [], state}
  end
end
```

## Wiring It All Up

To start the pipeline, we need to start the processes for our Producer & Consumer, and then link them together, so that items produced by the former get sent out to the latter:

```elixir
iex> {:ok, producer} = GenStage.start_link(Producer2, [])
{:ok, #PID<0.160.0>}

iex> {:ok, consumer} = GenStage.start_link(Consumer2, [])
{:ok, #PID<0.162.0>}

iex> GenStage.sync_subscribe(consumer, to: producer, max_demand: 3)
{:ok, #Reference<0.2486793675.579338241.116277>}
Demanding 3
Received block 0x1
Received block 0x2
Received block 0x3
Demanding 1
Received block 0x4
Received block 0x5
Demanding 1
```

Notice that even though we start the Producer at the beginning, it only started fetching blocks once we wired the Consumer to it. That’s because there was no demand until that point. Additionally, even though we specify `max_demand: 3`, that’s not necessarily the amount requested at all times. Since we only have a single Consumer, and it takes 1 second to process each block, the GenStage is smart enough not to overflow it with too many blocks. It adjusts the number of events as needed.
