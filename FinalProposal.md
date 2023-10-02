# Dungeon Master's Toolkit
For my final capstone project I want to build a web app that can be used as a sort of useful toolkit for running a game. World Anvil and Campfire are helpful for managing the writing aspect of Dungeons and Dragons, but they don't help with the number crunching very much. This toolkit's primary purpose is to streamline and automate aspects of the game that can be tedious to do manually.

## Key Features
The following are the primary tools I am considering making. Each would have a "Create" screen where the nessecary details can be entered and a "Run" screen where the virtual dice are rolled and the details specified by those dice are pulled from the API. Custom content can be made visible to other users for them to use in their games.
- NPC Manager
    - Keep stat block, story notes, and personality traits in one place
- Stat Block Manager
    - Can either be custom monsters or monsters pulled from the WikiDot API
    - Stat block also comes with PNGs to be used on battlemaps
    - Built in Challenge Rating Calculator can be used to adjust the CR depending on the party's player count and equipment.
- Encounter Creator
    - Save encouters for story beats or random encounters
    - Can specify size and quantity of dice used to calculate monster numbers
    - Running the encounter will roll the specified dice and pull up the specified monster's stat block.
- Random Encounter Table Creator
    - Can use either dice or percentages to set the odds of an enounter occurring
    - Running a Random Encounter Table will pull up all the details of the encounter with one click of a button
- Initiative Manager
    - Tracks PC and Monster initiative order simply by keeping the list sorted
    - Has important PC stats like AC and passives
    - Tracks monster health and status effects
    - Can be generated directly from an encounter
    - Has quick references for status effects, horde rules, and other handy things that are on the DM screen
- Weather Generator
    - Specify the lattitude and time of year and a randomly generated percipitation, wind, and temperature will be calculated
    - Custom weather tables could be made for more unusual biomes
## Use Case 
1. After loggin in, the user would be taken to a home screen where all the tools would be listed. Each tool would have a "Create" or "Use" link. The "Create" link would take the user to a form where a new stat block/encounter/etc. can be made. 
2. The "Use" link would take the user to the list of the tools the user has access to. To begin with it would just be the default/example tools that come with the user generation. There would be an option to search community created content and add it to the user's list. 
3. Clicking on any of the tools in the list will bring the user to the "Run" screen of the selected tool. Each tool would behave as specified in the previous section
4. Tools on the user's list can be removed from the view and hidden from that user, but not any other user.

## Technology being used
Think that a React frontend that accesses the data through a custom Express backend would be the best way to do this. WikiDot has a free API I can use for a lot of the default stat block details, and I can use the PNG API that I made in the Capstone 1 for that part of the stat block.