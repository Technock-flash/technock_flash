import { render } from '@testing-library/react';
import * as axe from 'axe-core';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { store } from './core/store/store';

describe('Accessibility checks', () => {
  it('has no detectable a11y violations on main route', async () => {
    const { container } = render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
