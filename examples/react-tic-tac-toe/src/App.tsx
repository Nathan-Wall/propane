import { usePropaneState, update } from '@propane/react';
import { GameState, BoardState, Cell } from './types.pmsg.ts';

// Calculate winner from cells array
function calculateWinner(cells: readonly Cell[]): Cell {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

// Square component
function Square({
  value,
  onClick
}: {
  value: Cell;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        width: 60,
        height: 60,
        fontSize: 24,
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: '#fff',
        border: '1px solid #999',
      }}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

// Board component
function Board({
  cells,
  onPlay
}: {
  cells: readonly Cell[];
  onPlay: (index: number) => void;
}) {
  const winner = calculateWinner(cells);
  const xIsNext = cells.filter(c => c !== null).length % 2 === 0;

  let status: string;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (cells.every(c => c !== null)) {
    status = 'Draw!';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const handleClick = (i: number) => {
    if (winner || cells[i]) return;
    onPlay(i);
  };

  const renderSquare = (i: number) => (
    <Square key={i} value={cells[i]} onClick={() => handleClick(i)} />
  );

  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 18, fontWeight: 'bold' }}>
        {status}
      </div>
      <div style={{ display: 'flex' }}>{[0, 1, 2].map(renderSquare)}</div>
      <div style={{ display: 'flex' }}>{[3, 4, 5].map(renderSquare)}</div>
      <div style={{ display: 'flex' }}>{[6, 7, 8].map(renderSquare)}</div>
    </div>
  );
}

// Create initial empty board
function createEmptyBoard(): BoardState {
  return new BoardState({
    cells: [null, null, null, null, null, null, null, null, null],
  });
}

// Main App component
function App() {
  // Initialize game state with Propane
  // Deep updates will automatically propagate via usePropaneState
  const [game] = usePropaneState<GameState>(
    new GameState({
      history: [createEmptyBoard()],
      currentMove: 0,
    })
  );

  const currentBoard = game.history.get(game.currentMove)!;
  const xIsNext = game.currentMove % 2 === 0;

  // Handle a play: add new board state to history
  const handlePlay = (index: number) => {
    // Get history up to current move (discard any "future" if we went back)
    const newHistory = game.history.filter((_, i) => i <= game.currentMove);

    // Create new cells with the move
    const newCells = currentBoard.cells.set(index, xIsNext ? 'X' : 'O');
    const newBoard = new BoardState({ cells: newCells });

    // update() enables React state changes from Propane setters
    update(game, g =>
      g
        .setHistory(newHistory.push(newBoard))
        .setCurrentMove(g.currentMove + 1)
    );
  };

  // Jump to a specific move in history
  const jumpTo = (move: number) => {
    update(game, g => g.setCurrentMove(move));
  };

  // Reset the game
  const resetGame = () => {
    update(game, g =>
      g
        .setHistory([createEmptyBoard()])
        .setCurrentMove(0)
    );
  };

  // Render move history buttons
  const moves = game.history.map((_, move) => {
    const description = move === 0 ? 'Go to game start' : `Go to move #${move}`;
    return (
      <li key={move}>
        <button
          onClick={() => jumpTo(move)}
          style={{
            fontWeight: move === game.currentMove ? 'bold' : 'normal',
          }}
        >
          {description}
        </button>
      </li>
    );
  });

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      display: 'flex',
      gap: '2rem',
    }}>
      <div>
        <h1>Propane Tic-Tac-Toe</h1>
        <Board cells={currentBoard.cells} onPlay={handlePlay} />
        <button
          onClick={resetGame}
          style={{ marginTop: 20, padding: '8px 16px' }}
        >
          New Game
        </button>
      </div>
      <div>
        <h2>History</h2>
        <ol style={{ padding: 0 }}>{moves}</ol>
      </div>
    </div>
  );
}

export default App;
