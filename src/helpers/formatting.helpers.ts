import { BN } from '@distributedlab/tools'

export const cropAddress = (address: string | undefined, length = 4) => {
  if (address === undefined) return ''

  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const formatAmount = (amount: string | undefined) => {
  if (amount === undefined) return '0.00'

  return BN.fromRaw(amount).format({
    decimalSeparator: '.',
    groupSeparator: ',',
    decimals: 2,
  })
}
