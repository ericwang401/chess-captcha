import Chessboard from 'chessboardjsx'
import React, { Fragment, createRef } from 'react'
import { Transition } from '@headlessui/react'
import StockFish from './integrations/Stockfish.js'

class Popup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showBoard: false,
    }
    this.chessBoardContainer = createRef()
  }

  componentWillReceiveProps(props) {
    if (props.open === true) {
      setTimeout(() => {
        if (this.props.open) {
          this.setState({
            showBoard: true,
            loser: '',
          })
        }
      }, 750)
    }
  }

  onBlur() {
    this.setState({
      showBoard: false,
    })
    this.props.handleBlur()
  }

  handleCheckmate(loser) {
    this.setState({
      loser: loser,
    })
  }

  submit() {
    this.onBlur()

    this.props.onCheckmate(this.state.loser)
  }

  render() {
    return (
      <>
        <Transition
          as={Fragment}
          show={this.props.open}
          enter='transition-opacity delay-1000 duration-150'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='absolute grid place-items-center z-10 inset-0'>
            <div
              className='absolute inset-0 bg-gray-500 opacity-40'
              onClick={() => this.onBlur()}
            ></div>
            <div className='bg-white w-full max-w-lg border border-gray-300 shadow-sm z-30'>
              <div className='px-2 mt-2 mb-2'>
                <div className='w-full p-6 text-white bg-blue-500'>
                  <h1 className='text-md'>Complete the following challenge</h1>
                  <h1 className='font-bold text-3xl'>checkmate a computer</h1>
                  <h1 className='text-md'>
                    Click verify once the opponent can't move.
                  </h1>
                </div>
              </div>

              <div className='px-2 mb-2' ref={this.chessBoardContainer}>
                {this.state.showBoard ? (
                  <StockFish onCheckmate={(loser) => this.handleCheckmate(loser)}>
                    {({ position, onDrop }) => (
                      <Chessboard
                        position={position}
                        orientation='black'
                        onDrop={onDrop}
                        width={
                          this.chessBoardContainer.current.offsetWidth - 16
                        }
                      />
                    )}
                  </StockFish>
                ) : (
                  <div className='grid place-items-center w-full aspect-square'>
                    <p>loading</p>
                  </div>
                )}
              </div>

              <div className='flex justify-end p-2 border-t border-gray-300'>
                  <div className="flex items-center flex-grow">{ (this.state.loser !== 'b' && this.state.loser !== '') && (<p>good job mate</p>) } { (this.state.loser !== 'w' && this.state.loser !== '') && (<p>lol</p>) }</div>
                <button className='uppercase flex-0 text-white font-bold disabled:bg-gray-300 bg-blue-500 px-7 py-3 rounded-sm' onClick={() => this.submit()} disabled={this.state.loser === ''}>
                  Verify
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </>
    )
  }
}

export default Popup
