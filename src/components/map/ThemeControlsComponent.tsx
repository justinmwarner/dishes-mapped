import type { JSX } from 'react'
import { ButtonComponent } from '../ButtonComponent'
import { DialogTitleComponent } from '../DialogTitleComponent'
import { TextComponent } from '../TextComponent'
import { ThemePanelComponent } from '../ThemePanelComponent'
import { getThemePanelTitle } from '../../map/utils'
import type { ThemeName } from '../../map/types'

type ThemeControlsComponentProps = {
  theme: ThemeName
  onThemeDark(): void
  onThemeLight(): void
}

export function ThemeControlsComponent(props: ThemeControlsComponentProps): JSX.Element {
  const isDark = props.theme === 'brutalist-dark'
  const isLight = props.theme === 'brutalist-light'

  return (
    <ThemePanelComponent>
      <DialogTitleComponent>{getThemePanelTitle(props.theme)}</DialogTitleComponent>
      <TextComponent>
        Country labels are cleaner, city labels are slightly larger, and markers now cluster.
      </TextComponent>
      <div className="theme-actions">
        <ButtonComponent
          type="button"
          className={isDark ? 'theme-button-active' : undefined}
          onClick={props.onThemeDark}
        >
          Dark
        </ButtonComponent>
        <ButtonComponent
          type="button"
          className={isLight ? 'theme-button-active' : undefined}
          onClick={props.onThemeLight}
        >
          Light
        </ButtonComponent>
      </div>
    </ThemePanelComponent>
  )
}
