# 2048
A simple game of 2048.

## Architecture
Builds a "grid" of "tiles."  Each tile has a value and some respective actions.  
On an action: up, down, left, and right; the gameboard shifts the columns, merges the appropriate tiles, and shifts the columns again.
The grid (a 4x4 matrix) is transposed and reversed (where applicable) such that the above algoritm works in all directions.

## Neural Networks
This was originally built to train a neural network.  This master branch contains the network-free code.
A neural network would take the board-state as an input (the 4x4 matrix), and any of the four actions as an output.
The fitness level (if using genetic algorithms) could use the total score on the board.  

## Future Builds 
I will commit future builds that incorporate an LSTM with the NEAT algorithm.
