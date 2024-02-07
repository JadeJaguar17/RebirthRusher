# Commands
Every command has its own JS file. Each subfolder corresponds to the subcategory
that each command falls under. The file and subfolder name are what shows up in
`/help`. The general file structure for each file looks something like this:

```js
// import libraries here

module.exports = {
    name: "command name",
    description: "command description that shows up in /help",
    syntax: "Describes how to use command [optional] <required>",
    execute: async function(interaction, args) {
        // logic for the command goes here
    },
    options: [] // array of Discord interaction option objects
}

// helper functions
```
