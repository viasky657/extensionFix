import * as React from 'react';
import {createRoot} from 'react-dom/client';
import './vs-code-elements'
import App from './app';

const rootNodeId = 'root'
const rootDomNode = document.getElementById(rootNodeId);
if (!rootDomNode) {
  throw new Error(`Root node with id '${rootNodeId} not found.`)
}
const root = createRoot(rootDomNode);
root.render(<App />);