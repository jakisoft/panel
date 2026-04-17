import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/components/App';
import { setConfig } from 'react-hot-loader';

import './i18n';

setConfig({ reloadHooks: false });

ReactDOM.render(React.createElement(App), document.getElementById('app'));
