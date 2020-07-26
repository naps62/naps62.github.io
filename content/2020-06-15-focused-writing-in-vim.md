+++
title="Focused Writing in Vim"
slug="focused-writing-in-vim"
date=2020-06-15
category="vim"
+++

[gist]: https://gist.github.com/naps62/20e71350443191dd002c6dc640eef0c4

I've been working on getting an improved focus environment to write blog posts in. There's a lot of "Focus mode"
features out there in pretty much every editor. But in Vim, I wanted to piece together a few different things, and also
make some additions of my own.

I use a 4K monitor, which is great for gaming & programming, but kind of overkill for writing blog posts. I don't
want all that real estate.

## The end result

So here's the gist of what I achieved (or a video right below, showcasing the final thing). Running `:Focus` on Vim does
a bunch of different things:
* Center & focus the 80-wide lines of content;
* Increase the font size... a lot;
* Hide away all the visual noise (statusbars, line numbers, autocomplete, window manager, and so on);
* Disable editor features targeted at programming (looking at you, autocomplete);
* *Maybe* have a Table of Contents on the left side, for easy navigation on long posts.

{{ yt(id="8dLIDBKkbCI") }}

All of this is achieved with a few existing vim plugins, all tied together in a single `Focus()` function. There's also
some bits that need to go beyond Vim, such as increasing font size, for instance.

## The road towards it

Let's start with the easy stuff. Creating a `:Focus` command is pretty straightforward.

```vim
let g:focused = 0
function! Focus()
  if g:focused == 0
    " magically enable focus stuff
    let g:focused = 1
  else
    " disable all of it again
    let g:focused = 1
  endif
endfunction
```

We can even have our function work as a toggle. Calling it a second time will (ideally) undo all the evil we did.

Let's now go through all the stuff we can enable in that if statement. Feel free to cherry-pick whichever ones work for
you. That's the beauty of using custom vim code instead of a one-size-fits-all solution.

PS: For each section, I'll include the vimscript code necessary to enable it. For disabling it (the `else` part of
the `if` statement), check out the full code in [this gist][gist].

### 1. [Goyo](https://github.com/junegunn/goyo.vim) - Distraction-free mode

This plugin adds a distraction-free mode to Vim, which hides most the of clutter already.

```vim
" enable distraction-free with a 120 column wide buffer
:Goyo 120
```

### 2. [Limelight](https://github.com/junegunn/limelight.vim) - for even more focus

Built by the same author, this goes one step further, and dims down all content but the currently highlighted paragrah.

```vim
:Limelight
```

### 3. [VOoM](https://www.vim.org/scripts/script.php?script_id=2657)

Yet another package. This one adds a Table of Contents to the left of your content buffer. It builds an index for markdown and other standard content formats, making it pretty useful for navigating large files.

```vim
" enable sidebar TOC for a markdown file
:VOoM markdown
```

### 4. Disable additional vim clutter

Now for the actual custom stuff. These are a few small settings that I normally use on Vim, but wanted to disable while
in focus mode:

```vim
" disable highlighting of the current line
set nocursorline

" disable highlighting of the current column
set nocursorcolumn

" even though Goyo hides the status bar, a small `-- INSERT --`
" was still showing up in the corner.
" This gets rid of that as well
set noshowmode
```

### 5. Always-centered cursor

This one is probably the most hacky thing on this list. Sorry, but I couldn't resist

I wanted the current line to always be vertically centered as well.

Using `set scrolloff=20` would tell vim to scroll 20
lines past the End-of-File. But while writing, the current text would still end at the bottom of the screen, unless
I manually scrolled down those extra lines.

The trick is to override the default navigation mappings, and combine them with `zz` which brings the cursor current
line to the vertical center of the screen:

```vim
:nmap j jzz
:nmap k kzz
:nmap G Gzz
```

`j`, `k` and `G` are the movements I use most often. Appending `zz` to them automatically keeps my current focus right
at the center. It's not perfect, but it's close enough.

### 6. Hiding tmux's status bar

Since I always run Vim inside a tmux session, I wanted to hide that as well. This one is actually pretty simple:

```vim
:silent !tmux set status off
```

### 7. Increase font size

This was the final piece, and another trick I had to use. However, without a bigger font size, everything before this
would really suck. 14pt fonts centered on a 4K monitor isn't really that useful, nor comfortable

I use [alacritty](https://github.com/alacritty/alacritty). Like most other terminals, there are shortcuts to zoom
in/out, and reset. In my case, I have those set to `Ctrl+'`, `Ctrl+-` and `Ctrl+0`, respectively. In `alacritty.yml`'s
config file, that translates to:

```yaml
key_bindings:
  - { key: Key0,       mods: Control, action: ResetFontSize    }
  - { key: Apostrophe, mods: Control, action: IncreaseFontSize }
  - { key: Subtract,   mods: Control, action: DecreaseFontSize }
```

As far as I could tell, there is no command line API that I could call to achieve the same effects, so I went with the
keyboard shortcuts. Using `xdotool`, it's easy to send those keystroke signals to the terminal window, with a single
command:

```vim
:silent !xdotool key --repeat 10 Ctrl+apostrophe
```

This is using [xdotool](https://jlk.fjfi.cvut.cz/arch/manpages/man/xdotool.1.en) to send a zoom-in shortcut signal to the active window, 10 times.
A similar `xdotool key Ctrl+0` can be used to get back to the default zoom level at the end.

10 was just an arbitrary number that got me to a visually comfortable level.

## Wrapping up

I used this full setup for the first time while writing this post. It has a few rough edges that I'll still be
improving on in the future, but it's already proven extremely helpful.
Check out the full [vim code here][gist], or let me know on [twitter](https://twitter.com/naps62) if you have any thoughts on how to improve this.