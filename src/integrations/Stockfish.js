import { Component } from 'react'
import PropTypes from 'prop-types'
const Chess = require('chess.js') // import Chess from  "chess.js"(default) if recieving an error about new Chess not being a constructor

const STOCKFISH = window.STOCKFISH
const game = new Chess()

class Stockfish extends Component {
  static propTypes = { children: PropTypes.func }

  state = { fen: 'start' }

  componentDidMount() {
    this.setState({ fen: game.fen() })

    this.engineGame().prepareMove()
  }

  onDrop = ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    })

    // illegal move
    if (move === null) return

    return new Promise((resolve) => {
      this.setState({ fen: game.fen() })
      resolve()
    }).then(() => this.engineGame().prepareMove())
  }

  engineGame = (options) => {
    options = options || {}

    /// We can load Stockfish via Web Workers or via STOCKFISH() if loaded from a <script> tag.
    let engine =
      typeof STOCKFISH === 'function'
        ? STOCKFISH()
        : new Worker(options.stockfishjs || 'stockfish.js')
    let evaler =
      typeof STOCKFISH === 'function'
        ? STOCKFISH()
        : new Worker(options.stockfishjs || 'stockfish.js')
    let engineStatus = {}
    let time = { wtime: 3000, btime: 3000, winc: 1500, binc: 1500 }
    let playerColor = 'black'
    let clockTimeoutID = null
    // let isEngineRunning = false;
    let announced_game_over
    // do not pick up pieces if the game is over
    // only pick up pieces for White

    setInterval(() => {
      if (announced_game_over) {
        return
      }

      if (game.game_over()) {
        announced_game_over = true

        this.props.onCheckmate(game.turn())
      }
    }, 500)

    function uciCmd(cmd, which) {
      // console.log('UCI: ' + cmd);

      ;(which || engine).postMessage(cmd)
    }
    uciCmd('uci')

    function clockTick() {
      let t =
        (time.clockColor === 'white' ? time.wtime : time.btime) +
        time.startTime -
        Date.now()
      let timeToNextSecond = (t % 1000) + 1
      clockTimeoutID = setTimeout(clockTick, timeToNextSecond)
    }

    function stopClock() {
      if (clockTimeoutID !== null) {
        clearTimeout(clockTimeoutID)
        clockTimeoutID = null
      }
      if (time.startTime > 0) {
        let elapsed = Date.now() - time.startTime
        time.startTime = null
        if (time.clockColor === 'white') {
          time.wtime = Math.max(0, time.wtime - elapsed)
        } else {
          time.btime = Math.max(0, time.btime - elapsed)
        }
      }
    }

    function startClock() {
      if (game.turn() === 'w') {
        time.wtime += time.winc
        time.clockColor = 'white'
      } else {
        time.btime += time.binc
        time.clockColor = 'black'
      }
      time.startTime = Date.now()
      clockTick()
    }

    function get_moves() {
      let moves = ''
      let history = game.history({ verbose: true })

      for (let i = 0; i < history.length; ++i) {
        let move = history[i]
        moves +=
          ' ' + move.from + move.to + (move.promotion ? move.promotion : '')
      }

      return moves
    }

    const prepareMove = () => {
      stopClock()
      // this.setState({ fen: game.fen() });
      let turn = game.turn() === 'w' ? 'white' : 'black'
      if (!game.game_over()) {
        // if (turn === playerColor) {
        if (turn !== playerColor) {
          // playerColor = playerColor === 'white' ? 'black' : 'white';
          uciCmd('position startpos moves' + get_moves())
          uciCmd('position startpos moves' + get_moves(), evaler)
          uciCmd('eval', evaler)

          if (time && time.wtime) {
            uciCmd(
              'go ' +
                (time.depth ? 'depth ' + time.depth : '') +
                ' wtime ' +
                time.wtime +
                ' winc ' +
                time.winc +
                ' btime ' +
                time.btime +
                ' binc ' +
                time.binc
            )
          } else {
            uciCmd('go ' + (time.depth ? 'depth ' + time.depth : ''))
          }
          // isEngineRunning = true;
        }
        if (game.history().length >= 2 && !time.depth && !time.nodes) {
          startClock()
        }
      }
    }

    evaler.onmessage = function (event) {
      let line

      if (event && typeof event === 'object') {
        line = event.data
      } else {
        line = event
      }

      // console.log('evaler: ' + line);

      /// Ignore some output.
      if (
        line === 'uciok' ||
        line === 'readyok' ||
        line.substr(0, 11) === 'option name'
      ) {
        return
      }
    }

    engine.onmessage = (event) => {
      let line

      if (event && typeof event === 'object') {
        line = event.data
      } else {
        line = event
      }
      // console.log('Reply: ' + line);
      if (line === 'uciok') {
        engineStatus.engineLoaded = true
      } else if (line === 'readyok') {
        engineStatus.engineReady = true
      } else {
        let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)
        /// Did the AI move?
        if (match) {
          // isEngineRunning = false;
          game.move({ from: match[1], to: match[2], promotion: match[3] })
          this.setState({ fen: game.fen() })
          prepareMove()
          uciCmd('eval', evaler)
          //uciCmd("eval");
          /// Is it sending feedback?
        } else if (
          (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/))
        ) {
          engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2]
        }

        /// Is it sending feed back with a score?
        if ((match = line.match(/^info .*\bscore (\w+) (-?\d+)/))) {
          let score = parseInt(match[2], 10) * (game.turn() === 'w' ? 1 : -1)
          /// Is it measuring in centipawns?
          if (match[1] === 'cp') {
            engineStatus.score = (score / 100.0).toFixed(2)
            /// Did it find a mate?
          } else if (match[1] === 'mate') {
            engineStatus.score = 'Mate in ' + Math.abs(score)
          }

          /// Is the score bounded?
          if ((match = line.match(/\b(upper|lower)bound\b/))) {
            engineStatus.score =
              ((match[1] === 'upper') === (game.turn() === 'w')
                ? '<= '
                : '>= ') + engineStatus.score
          }
        }
      }
      // displayStatus();
    }

    return {
      start: function () {
        uciCmd('ucinewgame')
        uciCmd('isready')
        uciCmd('setoption name Skill Level value 3')
        engineStatus.engineReady = false
        engineStatus.search = null
        prepareMove()
        announced_game_over = false
      },
      prepareMove: function () {
        prepareMove()
      },
    }
  }

  render() {
    const { fen } = this.state
    return this.props.children({ position: fen, onDrop: this.onDrop })
  }
}

export default Stockfish
