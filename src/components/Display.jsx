import React from 'react'

import { BEGIN, END, SUMMARY, RANKING } from '../utils/constants'
import util from '../utils/util'
import Jogada from './Jogada'

import './Display.css'

const getMatch = (matchesData, status) => {
  
  return (
    matchesData.map( (matchInfo, i) => {
      
      const index = status === RANKING ? (i + 1) : matchInfo.matchNum
      const name = util.toBlankSpace(matchInfo.player)

      return <Jogada key={i} index={index} name={name} 
        steps={matchInfo.attemptsNum} time={matchInfo.time}
        ></Jogada>
    })
  )
}

export default (props) => {
  const { status, text, title, matches } = props

  const textStyle = status === BEGIN ? {fontSize: 1 + 'em'} : {fontSize: 3 + 'em'}

  const textContent =       
    <div className="container border border-secondary rounded text-center">
      <p className="text-monospace" style={textStyle}>{text}</p>
    </div>

  const matchContent = 
    <table className="table table-striped text-monospace">
      <thead className="thead-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Steps</th>
          <th scope="col">Time</th>
        </tr>
      </thead>
      <tbody>
        { 
          (status === END || status === SUMMARY || status === RANKING) 
            ? getMatch(matches, status) : null 
          }
      </tbody>
    </table>


  const content = (status === END || status === SUMMARY ||status === RANKING) 
    ? matchContent : textContent

  return (
    <div className="container p-3 display-space">
      <div className="display-title border-bottom-0 rounded text-center">
        <h3 className="mb-0">{title}</h3>
      </div>
      {content}
    </div>
  )
}