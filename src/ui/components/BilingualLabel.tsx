import { bilingual, type StringKey } from '../../i18n/strings'

export function BilingualLabel({ k }: { k: StringKey }) {
  return <span>{bilingual(k)}</span>
}
