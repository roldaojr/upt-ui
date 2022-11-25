import { useTheme as useNextTheme } from 'next-themes'
import { Switch, useTheme } from '@nextui-org/react'
import { SunIcon } from '../icons/SunIcon'
import { MoonIcon } from '../icons/MoonIcon'
import { useCallback } from 'react'


export const ThemeSwitch = () => {
  const { setTheme } = useNextTheme()
  const { isDark } = useTheme()
  const changeTheme = useCallback(e => {
    setTheme(e.target.checked ? 'dark' : 'light')
  }, [setTheme])
  return (
    <Switch
      color="default"
      checked={isDark}
      iconOff={<SunIcon filled />}
      iconOn={<MoonIcon filled />}
      onChange={changeTheme}
    />
  )
}
