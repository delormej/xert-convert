# xert-convert
Node.js app that loads a workout from xertonline.com and converts to a Garmin TCX workout or ERG file format.

Requires Node.js 4.x or greater.

// Default example outputs erg format.
example usage: node main.js -u USER -p PASSWORD EMvoLmeakb8lXi1B 

// Example specifying tcx output format.
example usage: node main.js -u USER -p PASSWORD -o tcx EMvoLmeakb8lXi1B