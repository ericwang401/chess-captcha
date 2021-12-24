import './App.css'
import React, { Fragment } from 'react'
import logo from './assets/images/logo_48.png'
import checkmark from './assets/images/checkmark.png'
import Popup from './Popup'
import { Transition } from '@headlessui/react'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      loser: '',
      checkmarkStyle: {
        backgroundImage: 'url(' + checkmark + ')',
        backgroundPosition: '0px 0px',
        width: '38px',
        height: '30px',
        marginLeft: '-5px',
      },
    }
  }

  handlePopup() {
    this.setState({
      open: true,
    })
  }

  onBlur() {
    this.setState({
      open: false,
    })
  }

  handleCheckmate(loser) {
    this.setState({
      loser: loser,
    })
    setTimeout(() => {
      for (let i = 0, length = 20; i < length; i++) {
        setTimeout(() => {
          let checkmarkStyle = { ...this.state.checkmarkStyle }

          checkmarkStyle.backgroundPosition = `0px -${i * 30}px`

          this.setState({ checkmarkStyle })
        }, i * 15)
      }
    }, 150)
  }

  render() {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <div className='inline-flex items-stretch w-72 justify-between py-2 px-3 border border-gray-300 rounded-[.15rem] shadow-sm bg-[#F9F9F9]'>
          <div className='flex items-center space-x-3'>
            <div className='w-7 h-7'>
              <Transition
                as={Fragment}
                show={
                  !this.state.open &&
                  (this.state.loser === ''
                    ? true
                    : this.state.loser === 'b' && false)
                }
                enter='transition-all transform duration-150'
                enterFrom='rounded-none scale-0'
                enterTo='rounded-full scale-100'
                leave='transition-all transform duration-150'
                leaveFrom='rounded-full scale-100'
                leaveTo='rounded-none scale-0'
              >
                <button
                  id='checkmark'
                  onClick={() => this.handlePopup()}
                  className='absolute border-2 w-7 h-7 border-gray-400 rounded-sm bg-white active:bg-[#EBEBEB]'
                ></button>
              </Transition>

              <Transition
                as={Fragment}
                show={this.state.open}
                enter='transition-opacity duration-150'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity duration-150'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <svg
                  className='absolute spinner w-7 h-7'
                  viewBox='0 0 66 66'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <circle
                    className='path'
                    fill='none'
                    strokeWidth='6'
                    cx='33'
                    cy='33'
                    r='30'
                  ></circle>
                </svg>
              </Transition>

              <Transition
                as={Fragment}
                show={this.state.open}
                enter='transition-opacity duration-150'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity duration-150'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <svg
                  className='absolute spinner w-7 h-7'
                  viewBox='0 0 66 66'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <circle
                    className='path'
                    fill='none'
                    strokeWidth='6'
                    cx='33'
                    cy='33'
                    r='30'
                  ></circle>
                </svg>
              </Transition>

              <Transition
                as={Fragment}
                show={
                  !this.state.open &&
                  (this.state.loser === ''
                    ? false
                    : this.state.loser === 'b' && true)
                }
                enter='transition-opacity duration-150'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity duration-150'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <div style={this.state.checkmarkStyle}></div>
              </Transition>
            </div>
            <label
              htmlFor='checkmark'
              className='flex items-center text-sm mr-5 h-full'
            >
              I'm not a robot
            </label>
          </div>
          <div className='flex flex-col items-center'>
            <img src={logo} className='w-8 h-8' alt='recaptcha logo' />
            <p className='text-[.6rem] text-gray-600'>reCAPTCHA</p>
            <p className='text-[.6rem] text-gray-600'>Privacy - Terms</p>
          </div>

          <Popup
            onCheckmate={(loser) => this.handleCheckmate(loser)}
            open={this.state.open}
            handleBlur={() => this.onBlur()}
          />
        </div>
        <p className='text-sm font-bold mt-3'>{ !this.state.open &&
                  (this.state.loser === ''
                    ? ''
                    : this.state.loser === 'b' && 'good stuff man. ur verified despite losing') }</p>
        <p className='text-sm font-bold mt-3'>{ !this.state.open &&
                  (this.state.loser === ''
                    ? ''
                    : this.state.loser === 'w' && 'haha I caught you, you can\'t beat a computer u must be a robot') }</p>
        <p className='text-sm mt-3'>Stockfish skill level: 3</p>
      </div>
    )
  }
}

export default App
