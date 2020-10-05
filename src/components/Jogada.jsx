import React from 'react'
import './Jogada.css'

export default (props) => {
  return (
    <tr>
      <th scope="row">{props.index}</th>
      <td>{props.name}</td>
      <td>{props.steps}</td>
      <td>{props.time}</td>
    </tr>
  )
}