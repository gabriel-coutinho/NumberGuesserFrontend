import React, { Component, Fragment } from 'react';
import Api from './Api'

import Display from './components/Display'
import { 
  BEGIN, 
  PLAYING, 
  END, 
  SUMMARY,
  RANKING,
  RULES,
  DISPLAY_BEGING_NAME,
  DISPLAY_PLAYING_NAME,
  DISPLAY_RANKING_NAME,
  DISPLAY_CURRENT_MATCH,
  DISPLAY_PLAYER_MATCH,
  MAX_RANDOM_NUMBER,
  MIN_RANDOM_NUMBER
} from './utils/constants'
import util from './utils/util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

const randomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);  
const validateNumber = (value) => {
  let validated = true

  if (isNaN(value)){
    validated = false
    alert('Esse campo precisa ser um número')
  }
  else {
    const int = parseInt(value, 10)

    if (int < 3) {
      validated = false
      alert('Escolha um número maior ou igual a 3!')
    }
  }

  return validated
}

export default class App extends Component {

  constructor(props){
    super(props)

    this.state = {
      displayName: DISPLAY_BEGING_NAME,
      status: BEGIN,
      guess: RULES,
      max_number: MAX_RANDOM_NUMBER,
      min_number: MIN_RANDOM_NUMBER,
      steps: 0,
      matches: [],
      matchesPlayer: [],
      name: '',
      top: '',
      yourMatches: 5,
      matchNum: 0
    }

    this.setName = this.setName.bind(this)
    this.onStart = this.onStart.bind(this)
    this.onSame = this.onSame.bind(this)
    this.onFinish = this.onFinish.bind(this)
    this.onLess = this.onLess.bind(this)
    this.onBig = this.onBig.bind(this)
    this.onBegin = this.onBegin.bind(this)
    this.setTop = this.setTop.bind(this)
    this.setYourMatches = this.setYourMatches.bind(this)
    this.getTop = this.getTop.bind(this)
    this.getYourMatches = this.getYourMatches.bind(this)
    this.onPlayAgain = this.onPlayAgain.bind(this)
  }


  async componentDidMount(){
    try {
      const url = `/rank?linesPerPage=${this.state.top}`
      const res = await Api.get(url)
  
      this.setState({
        matches: res.data.content
      })
    } catch (error) {
      alert(error)
    }
  }

  async getTop() {
    try {
      const { top } = this.state

      const validated = validateNumber(top)

      if (validated){
        const resRanking = await Api.get(`/rank?linesPerPage=${this.state.top}`)
    
        this.setState({
          matches: resRanking.data.content
        })
      }
    } catch (error) {
      alert(error)
    }

  }

  async getYourMatches() {
    try {
      const { name } = this.state

      const url = `/finish?player=${name}`
      
      const res = await Api.get(url)
      
      this.setState({
        matchesPlayer: res.data.content
      })
    } catch (error) {
      alert(error)
    }
  }

  setName(event) {
    this.setState({
      name: event.target.value
    })
  }

  setTop(event) {
    this.setState({
      top: event.target.value
    })
  }

  setYourMatches(event) {
    this.setState({
      yourMatches: event.target.value
    })
  }

  onPlayAgain() {
    const { name, matchNum } = this.state

    const max = MAX_RANDOM_NUMBER
    const min = MIN_RANDOM_NUMBER
    const randomNumber = randomNumberBetween(min, max)

    this.setState({
      status: PLAYING,
      displayName: DISPLAY_PLAYING_NAME,
      max_number: max,
      min_number: min,
      guess: randomNumber,
      steps: 1,
      start: new Date().getTime(),
      matchNum: matchNum + 1,
      name: util.normalizeName(name)
    })
  }

  async onStart() {
    try {
      const { name } = this.state

      if (!name || name === '') 
        throw new Error('Por favor, escreva um nome antes de continuar...')
      else{
        const url = `/unavailable?player=${name}`
  
        const existedPlayer = await Api.get(url)
        
        if (existedPlayer.data) throw new Error('Já existe um jogador com esse nome :(')
        else {
          this.onPlayAgain()
        }
      }
    } catch (error) {
      alert(error)
    }
  }

  onLess() {
    const min = this.state.min_number
    let max = this.state.guess
    if(max - min > 1) max -= 1;

    const randomNumber = randomNumberBetween(min, max)

    this.setState({
      guess: randomNumber,
      max_number: max,
      steps: (max === min ) ? this.state.steps : this.state.steps + 1
    })
  }

  onBig() {
    let min = this.state.guess
    const max = this.state.max_number
    if(max - min > 1) min += 1;
    const randomNumber = randomNumberBetween(min, max)

    this.setState({
      guess: randomNumber,
      min_number: min,
      steps: (max === min ) ? this.state.steps : this.state.steps + 1
    })
  }

  async onSame() {
    try {
      // POST DE PARTIDA
      // ATUALIZAR MATCHESPLAYER COM O RETORNO DO POST
      const end = new Date().getTime()

      const body = {
        player: this.state.name,
        attemptsNum: this.state.steps,
        matchNum: this.state.matchNum,
        timeStart: this.state.start,
        timeFinish: end
      }

      const match = await Api.post('/', body)

      this.setState({
        displayName: DISPLAY_CURRENT_MATCH,
        status: SUMMARY,
        end,
        matchesPlayer: [match.data]
      })
    } catch (error) {
      alert(error)
    }
  }

  async onFinish() {
    await this.getYourMatches()

    this.setState({
      displayName: DISPLAY_PLAYER_MATCH,
      status: END
    })
  }

  onBegin() {
    try {
      this.setState({
        displayName: DISPLAY_BEGING_NAME,
        status: BEGIN,
        guess: RULES,
        matchesPlayer: [],
        name: '',
        top: '',
        yourMatches: 5,
        matchNum: 0
      })

      this.componentDidMount()
    } catch (error) {
      alert(error)
    }

  }
  
  render(){
    const { status } = this.state

    const centerButton1 = status === BEGIN ? 
      <button 
        type="button" className="btn btn-success btn-lg text-button" onClick={this.onStart}>
          Start
      </button>: null   
    
    const centerButton2 = status === PLAYING ? 
      <button 
        type="button" className="btn btn-success btn-lg text-button" onClick={this.onSame}>
          Same
      </button>: null     
  
    const centerButton3 = status === END ? 
      <button 
        type="button" className="btn btn-primary btn-lg text-button" onClick={this.onBegin}>
          Begin
      </button>: null 

    const leftButton1 = status === PLAYING ?
      <button type="button" className="btn btn-info btn-lg text-button" onClick={this.onLess}>
        Less
      </button> : null

    const leftButton2 = status === SUMMARY ?
      <button type="button" className="btn btn-info btn-lg text-button" onClick={this.onPlayAgain}>
        Play again
      </button> : null

    const rightButton1 = status === PLAYING ?
      <button type="button" className="btn btn-info btn-lg text-button" onClick={this.onBig}>
        Bigger
      </button> : null

    const rightButton2 = status === SUMMARY ?
      <button type="button" className="btn btn-info btn-lg text-button" onClick={this.onFinish}>
        Finish
      </button> : null

    const input = (
      <div className="input-div">
        <input 
          type="text" className="form-control input" aria-label="Small" 
          aria-describedby="inputGroup-sizing-sm" placeholder="Player name..." 
          value={this.state.name} onChange={this.setName}>
        </input>
      </div>  
    )
    
    return(
      <div>
        <Display 
          title={this.state.displayName} status={this.state.status} 
          text={this.state.guess} matches={this.state.matchesPlayer}>
        </Display>
        <div className="container container-buttons">
          <div className="button">{leftButton1 || leftButton2}</div>
          <div className="button">{centerButton1 || centerButton2 || centerButton3}</div>
          { status === BEGIN ? input : null }
          <div className="button">{rightButton1 || rightButton2}</div>
        </div>
        <hr></hr>
        { this.state.status === BEGIN ?
          <Fragment>
            <div className="container container-buttons">
              <input 
                type="text" className="form-control input top" aria-label="Small" 
                aria-describedby="inputGroup-sizing-sm" placeholder={`Rank size`} 
                value={this.state.top} onChange={this.setTop}>
              </input>
              <button 
                type="button" className="btn btn-outline-dark" onClick={this.getTop}
              >Get</button>
            </div>
              <Display 
                matches={this.state.matches} title={DISPLAY_RANKING_NAME} status={RANKING} >
              </Display>
          </Fragment> : null
        }
      </div>
    )
  }
}