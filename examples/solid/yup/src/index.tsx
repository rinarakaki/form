/* @refresh reload */
import { render } from 'solid-js/web'

import { createForm } from '@tanstack/solid-form'
import { yupValidator } from '@tanstack/yup-form-adapter'
import * as yup from 'yup'
import type { FieldApi } from '@tanstack/solid-form'

interface FieldInfoProps {
  field: FieldApi<any, any, any, any>
}

function FieldInfo(props: FieldInfoProps) {
  return (
    <>
      {props.field.state.meta.isTouched &&
      props.field.state.meta.errors.length ? (
        <em>{props.field.state.meta.errors.join(',')}</em>
      ) : null}
      {props.field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

function App() {
  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
    // Add a validator to support Yup usage in Form and Field
    validatorAdapter: yupValidator(),
  }))

  return (
    <div>
      <h1>Yup Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="firstName"
            validators={{
              onChange: yup
                .string()
                .min(3, 'First name must be at least 3 characters'),
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: yup
                .string()
                .test(
                  'no error',
                  "No 'error' allowed in first name",
                  async (value) => {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    return !value?.includes('error')
                  },
                ),
            }}
          >
            {(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label for={field().name}>First Name:</label>
                  <input
                    id={field().name}
                    name={field().name}
                    value={field().state.value}
                    onBlur={field().handleBlur}
                    onInput={(e) => field().handleChange(e.target.value)}
                  />
                  <FieldInfo field={field()} />
                </>
              )
            }}
          </form.Field>
        </div>
        <div>
          <form.Field name="lastName">
            {(field) => (
              <>
                <label for={field().name}>Last Name:</label>
                <input
                  id={field().name}
                  name={field().name}
                  value={field().state.value}
                  onBlur={field().handleBlur}
                  onInput={(e) => field().handleChange(e.target.value)}
                />
                <FieldInfo field={field()} />
              </>
            )}
          </form.Field>
        </div>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {(state) => {
            return (
              <button type="submit" disabled={!state().canSubmit}>
                {state().isSubmitting ? '...' : 'Submit'}
              </button>
            )
          }}
        </form.Subscribe>
      </form>
    </div>
  )
}

const root = document.getElementById('root')

render(() => <App />, root!)
