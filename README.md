# Rebirth Rusher
Hello, I'm JadeJaguar17. I created Rebirth Rusher back in December 2020 to help
[Idle Miner](https://top.gg/bot/518759221098053634) players, including myself,
optimize gameplay as much as possible. Some of the core features it has are:

- A graph that tracks your rebirths, prestiges, and rb/day across a 2-week period
- Reminder pings for things like:
    - Hunt, fish, farm
    - Legendary abilities
    - Backpack full
    - All the different kits
- A pet analyzer that calculates the most optimal pet upgrades
- ...and more!

For a long time, I stayed on top of maintenance. Whether it was adding new
features, adapting to DiscordAPI or Idle Miner changes, or fixing bugs, I was
pretty good at regularly releasing updates in a timely fashion. However, due to
becoming busier IRL, Idle Miner's decline, and a desire to work on other
projects, I can no longer stay up-to-date on all the latest changes. As a result,
I've decided to make my project open-source. That way, other players can either
create their own helper bots, or help contribute to the main repository.

Welp, that's it from me. Whether you directly fork off of this repository, or
copy just a part of it, I hope you will find my code to be useful. Join the
Rebirth Rusher support server if you have any questions or would like to contact
me for whatever reason.

Happy mining (and coding)!<br>
\- Jade 💚

## Code Outline
The library I use to access the DiscordAPI is [Eris](https://abal.moe/Eris/).
It's a lot more lightweight than [discord.js](https://discord.js.org/) and offers
more freedom to customize different functions. The database is MongoDB and I use
the `mongoose` package to work with it.

Note that I use CommonJS as opposed to ES6. While I typically use ES6, not all
the modules here support ES6 yet, so we'll have to stick with CommonJS for the
time being.

I would say my code structure is fairly straightforward, but I've added README's
in all of the different folders to help provide more guidance on both navigation
and the code itself.

Take a look at the [Trello](https://trello.com/b/4Z4MAGIV/rebirth-rusher) board
to see what I'm currently working on!

## Contributing
If you want to directly contribute to the main repository, by all means go ahead.
To do so, all you have to do is make a branch, do your thing, and make a pull
request. If it looks good, I'll approve it and add it to the bot. However, to
ensure this process goes smoothly, there are a few overall rules that I have:
- Commits should be clean and follow good practices (see [this article](https://cbea.ms/git-commit/))
- The code should also be clean with good comments. Try using JSDoc comments
  when you can (helps both developers and VSCode's IntelliSense)
- Generally speaking, I prefer code width to not exceed 80 characters
- The PR description should be detailed so I can easily understand what your PR
  is trying to do
- Make sure your code works and there's no bugs whatsover <small>(at the very
  least, you should document what bugs you found and why you didn't fix them)</small>
- **PRs should not be made to the `main` branch.** Instead, please have your PRs
  use the development branch as its base. The development branch typically
  follows a `#.#.#.` naming scheme depending on the upcoming version number of
  the bot.

My code is licensed by [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en).
Basically, you are free to fork, make changes, and re-release on your own, but
you have to give me credit and you can't use it to make money.
