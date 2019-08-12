# Train Scheduler 

Interactive Star Wars themed game using jQuery.

The goal of this project is to dynamically update HTML pages with the jQuery library.

The mechanics of this game include a combination of RPG and Fighting game elements. Characters progress and grow stronger as they defeat enemies like an RPG, but you will select your charater and your opponets as you would in a Fighting game.

For the combat calulations I have used D&D 5e as a basic guideline.

## Technologies

 * HTML-
 * CSS
 * JavaScript
 * jQuery

## Sources

[Wookieepedia, the Star Wars Wiki](https://starwars.fandom.com/wiki/)

## Game Mechanics 

### Basic Play

1. Player selects a hero character by clicking a hero icon.

![Select Hero](/documentation/hero_select.gif)

2. The player selects a villian character by clicking a villian icon.

![Select Villain](/documentation/villain_select.gif)

3. The player and villian have two actions, Attack and Defend.

  * Attack: Character attempts to deal damage to their opponent's health (HP).

![Player Attack](/documentation/player_attack.gif)

  * Defend: The character anticipates an attack from their opponent and attempts to evade the attack, with a chance of making a counter-attack.

  ![Player Defend](/documentation/player_defend.gif)

4. The goal is for the hero character to defeat each villian character, but the hero may lose the fight. A character will be defeated once their HP reaches zero.

5. If hero wins their HP is reset and they get an increase to key stats. Player will then select the next villian to fight.

6. If villian wins it is game over.

### Character Play Styles

Each character has their own suttle differences. Not only are HP, Strength, and Dexterity tailored to each character, but there is also Armor along with specific probably rates for combo and counter attack chance.

#### Character Stats

A brief explanation of key character stats.

##### hp: INT

Represents "Hit Points" which indicates whether a character has been defeated or not. When a character’s `HP` reaches zero they have been defeated.

##### strength: INT

`Strength` is a value used in determining `attack power` for certain characters. It differs from the `Attack` stat in that `strength` increases upon `level up`.

##### dexterity: INT

`Dexterity` is a value used in determining `attack power` for certain characters and, unlike `Strength`, it is used to  determine `Defense Rating` for all characters. It differs from the `defend` stat in that `dexterity` increases upon level up.

##### attack: INT

A modifier value that acts as a damage rating for the character’s particular weapon. `Attack` is used to determine `attack power` for some characters. This value does not change on `level up`.

##### defend: INT

A modifier value that acts as a rating to represent the character’s innate defensive abilities. `Defend` is used to determine `defense rating` for all characters. This value does not change on `level up`.

##### armorClass: INT

This value represents that some characters are wearing heavier armor than others. A character’s attack damage is only applied to the opponent's `HP` if it meets or exceeds the value of the opponent’s `armor class`.

##### counterAttack: INT

This value is used to determine damage done to opponent when character is successful at preemptively defending against attack. 

##### xpModifier: INT

Value used upon `level up` to increase player stats. This represents the particular character’s potential to grow as a combatant.

##### getAttackRoll: METHOD

Returns an integer value that represents the quality of the character’s attack. This vaue is compared to the `armor class` of the opponent, so that there is no guarantee that an attack made by a character will be successful against their opponent.

##### getComboHits: METHOD

Returns an integer value that represents the number of attacks to execute as the character’s single attack action. For most characters this value is hard-coded as one, but some characters get to make a dice roll to see how many attacks their combo will include.

##### getAttackPower: METHOD

Returns an integer that represents the damage that a character’s attack will do to their opponent. Some characters use `strength` to determine this value, others use `dexterity`.

##### getDefenseRating: METHOD

Returns an integer that represents the damage absorption. This is used when a character defends and their opponent attacks. The opponent’s attack will be reduced by a percentage that is determined by the `defense rating`.

##### getCounterAttackPower: METHOD

Returns an integer that represents the damage that a character’s attack will do to their opponent. Uses `dexterity` and `counter attack` to determine this value.

##### comboAttackRoll: METHOD

Returns a `true` or `false` to indicate that character is allowed to make a `combo attack` on opponent. Each character has a different probability to execute a `counter attack`, thematically based on the type of character and weapon they use.

##### counterAttackRoll: METHOD

Returns a `true` or `false` to indicate that character is allowed to make counter attack on opponent. Each character has a different probability to execute a counter attack, thematically based on the type of character and weapon they use.

##### levelUp: METHOD

When player character defeats an opponent the player gets stronger. This is represented by increasing player `HP`, `strength`, and `dexterity` by the value of a dice roll and the player character’s `xpModifier` value.

















