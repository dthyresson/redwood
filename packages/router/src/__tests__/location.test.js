import { render } from '@testing-library/react'

import { LocationProvider, useLocation } from '../location'

describe('useLocation', () => {
  const TestComponent = () => {
    const location = useLocation()
    const param = location.params.get('facts')
    console.log(JSON.stringify(location))
    return (
      <div>
        <p>{JSON.stringify(location)}</p>
        <input data-testid="pathname" defaultValue={location.pathname} />
        <input data-testid="search" defaultValue={location.search} />
        <input data-testid="hash" defaultValue={location.hash} />
        <input data-testid="params" defaultValue={param} />
      </div>
    )
  }

  it('returns the correct pathname, search, params, and hash values', () => {
    const mockLocation = {
      pathname: '/dunder-mifflin',
      search: '?facts=bears',
      params: '{}',
      hash: '#woof',
    }

    const { getByText, getByTestId } = render(
      <LocationProvider location={mockLocation}>
        <TestComponent />
      </LocationProvider>
    )

    expect(
      getByText(
        '{"pathname":"/dunder-mifflin","search":"?facts=bears","params":{},"hash":"#woof"}'
      )
    ).toBeTruthy()
    expect(getByTestId('pathname').value).toEqual('/dunder-mifflin')
    expect(getByTestId('search').value).toEqual('?facts=bears')
    expect(getByTestId('hash').value).toEqual('#woof')
    expect(getByTestId('params').value).toEqual('bears')
  })
})
