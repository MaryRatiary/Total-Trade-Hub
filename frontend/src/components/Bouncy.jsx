import { bouncy } from 'ldrs'
import { useEffect } from 'react'

// Default values shown
bouncy.register()

export const Bouncy = ({ size = '45', color = '#3B82F6', speed = 1.5 }) => {
  return (
    <l-bouncy
      size={size}
      speed={speed}
      color={color}
    ></l-bouncy>
  )
}

export default Bouncy
