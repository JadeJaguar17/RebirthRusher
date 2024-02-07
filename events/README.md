# Events
Each file corresponds to a Discord event that RbR cares about. The file name
has to match the event name exactly, otherwise it won't work. The events we care
about are:

- `guildCreate`: this is just for logging purposes to know when someone adds RbR
  to their server
- `guildDelete`: same as above, but when it gets kicked
- `interactionCreate`: handles mainly slash commands, but also others like
  buttons
- `messageCreate`: used for detecting Idle Miner messages and parsing them
  accordingly
- `messageUpdate`: used for detecting when Idle Miner edits one of its own
  messages (notably `/play` and upgrading `/pets`)
