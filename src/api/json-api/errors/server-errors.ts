import { toCamelCaseDeep } from '@/api/json-api/helpers'
import { AxiosError } from 'axios'
import {
  JsonApiErrorMetaType,
  JsonApiErrorBaseNestedErrors,
} from '@/api/json-api/types'

/**
 * Base class for server errors.
 */
export class JsonApiErrorBase extends Error {
  originalError: AxiosError
  _meta: JsonApiErrorMetaType
  _detail: string
  _title: string | undefined
  _nestedErrors: JsonApiErrorBaseNestedErrors
  _code: string
  _status: string

  constructor(originalError: AxiosError) {
    super(originalError.message)

    this.originalError = originalError
    this._meta = {}
    this._nestedErrors = []
    this._title = ''
    this._detail = ''
    this._code = ''
    this._status = ''
  }

  /**
   * Response HTTP status.
   */
  get httpStatus(): number | undefined {
    return this.originalError?.response?.status
  }

  /**
   * Error meta.
   */
  get meta(): JsonApiErrorMetaType {
    return this._meta
  }

  /**
   * A short, human-readable summary of the problem.
   */
  get title(): string | undefined {
    return this._title
  }

  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  get detail(): string {
    return this._detail
  }

  get requestPath(): string | undefined {
    return this.originalError?.response?.request?.path
  }

  get status(): string {
    return this._status
  }

  get code(): string {
    return this._code
  }
}

/**
 * Generic server error response.
 */
export class JsonApiError extends JsonApiErrorBase {
  constructor(originalError: AxiosError) {
    super(originalError)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const unwrappedError = originalError?.response?.data?.['errors']?.[0]
    this.name = unwrappedError?.['title'] ?? ''
    this._title = unwrappedError?.['title'] ?? ''
    this._detail = unwrappedError?.['detail'] ?? ''
    this._status = unwrappedError?.['status'] ?? ''
    this._code = unwrappedError?.['code'] ?? ''
    this._meta = toCamelCaseDeep(unwrappedError?.['meta'] || {})
  }
}

export class BadRequestError extends JsonApiError {
  /**
   * Wrap a raw API error response.
   */
  constructor(originalError: AxiosError) {
    super(originalError)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const errors = originalError?.response?.data?.['errors'] || []
    if (errors.length > 1) {
      this._title = 'Request contains some errors.'
      this._detail = 'Request contains some errors. Check "nestedErrors"'
      this._nestedErrors = errors.map((err: JsonApiError) => ({
        title: err?.['title'],
        detail: err?.['detail'],
        status: err?.['status'],
        code: err?.['code'],
        meta: toCamelCaseDeep(err?.['meta']),
      }))
    }
  }

  /**
   * Errors for every invalid field.
   */
  get nestedErrors(): JsonApiErrorBaseNestedErrors {
    return this._nestedErrors
  }
}

/**
 * 401(Unauthorized) error.
 */
export class UnauthorizedError extends JsonApiError {}

/**
 * 403(Forbidden) error.
 */
export class ForbiddenError extends JsonApiError {}

/**
 * (404)The requested resource was not found.
 */
export class NotFoundError extends JsonApiError {}

/**
 * The request could not be completed due to a conflict with the current state
 * of the target resource.
 */
export class ConflictError extends JsonApiError {}

/**
 * 500(Internal server) error
 */
export class InternalServerError extends JsonApiError {}

/**
 * Network error.
 */
export class NetworkError extends JsonApiError {}
