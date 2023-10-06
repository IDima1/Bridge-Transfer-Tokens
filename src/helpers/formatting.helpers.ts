import { BN } from '@/utils'

export const cropAddress = (address: string | undefined, length = 4) => {
  if (address === undefined) return ''

  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const formatAmount = (amount: string | undefined) => {
  if (amount === undefined) return '0.00'

  return new BN(amount).format({
    decimalSeparator: '.',
    groupSeparator: ',',
    decimals: 2,
  })
}
