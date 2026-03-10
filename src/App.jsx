import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import CelestialLayer from './components/CelestialLayer'
import HomeView from './components/views/HomeView'
import ConverterView from './components/views/ConverterView'
import FocusView from './components/views/FocusView'
import TimerView from './components/views/TimerView'
import StopwatchView from './components/views/StopwatchView'

function App() {
  const [activeTab, setActiveTab] = useState('view-home')

  return (
    <>
      <div className="map-container">
        {/* We only fully show the celestial layer on the home tab */}
        <div
          className="celestial-layer"
          style={{ opacity: activeTab === 'view-home' ? '1' : '0', transition: 'opacity 0.5s ease' }}
        >
          <CelestialLayer />
        </div>
      </div>

      <div className="gradient-overlay"></div>

      {/* Render all views but only the active one gets the "active" class to trigger the CSS fade transition */}
      <HomeView isActive={activeTab === 'view-home'} />
      <ConverterView isActive={activeTab === 'view-converter'} />
      <FocusView isActive={activeTab === 'view-focus'} />
      <TimerView isActive={activeTab === 'view-timer'} />
      <StopwatchView isActive={activeTab === 'view-stopwatch'} />

      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  )
}

export default App
