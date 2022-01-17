require('dotenv').config();

jest.setTimeout(30000);

import './tests/client';
import './tests/join-insert';
// import './tests/typing';
import './tests/selectors';
import './tests/permissions';
import './tests/handlers';

// import './tests/packager';
// TODO error if duplicates