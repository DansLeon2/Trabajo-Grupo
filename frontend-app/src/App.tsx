import { useState } from 'react'
import { Login } from './components/Login'
import './App.css'

function App() {
  return (
    <>
      <section id="center">
        {/* Aquí renderizamos tu módulo de Login */}
        <Login />
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App