import * as runtimeErrors from './runtime.errors'
import { errors as serverErrors } from './server.errors'

export const errors = {
  ...runtimeErrors,
  ...serverErrors,
}
