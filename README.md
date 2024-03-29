# Beard &ndash; Boolean Expressions As Rendered Diagrams

A simple parser and visualizer for boolean expressions.

Check out the [online demo](https://pedrosbmartins.github.io/beard/).

![Demo](/assets/demo.png)

## Operators

These are the currently supported operators, from highest to lowest precedence. Parenthesis `()` can be used to group operations and override precedence.

All operators and constants are case-insensitive.

| Operator | Aliases  |
| -------- | -------- |
| `NOT`    | `!`, `¬` |
| `AND`    | `*`, `·` |
| `XOR`    | `⊕`      |
| `OR`     | `+`      |

| Constant | Aliases |
| -------- | ------- |
| `TRUE`   | `1`     |
| `FALSE`  | `0`     |

## Credits

This project uses a modified version of the [binary-decision-diagram](https://github.com/pubkey/binary-decision-diagram) library.

Beard icon created by [Good Ware - Flaticon](https://www.flaticon.com/authors/good-ware).
