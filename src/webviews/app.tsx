import * as React from 'react';

interface vscode {
  postMessage(message: Record<string, any>): void;
}

declare const vscode: vscode;

const sendMessage = () => {
  console.log('button clicked')
  vscode.postMessage({ command: 'testing' });
}


const App = () => {
  const [buttonText, setButtonText] = React.useState('The brain is pending');
    
  React.useEffect(() => {
      window.addEventListener('message', (event) => {
        console.log('message from extension');
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
          case 'init':
            setButtonText('The brain is working');
            break;
        }
      });
    }, []);
  
  return (
    <div>
      <h1 className='bg-green-600'>Functional Components Work!</h1>
      <vscode-button id="button-1">Button</vscode-button>
      <button onClick={sendMessage}>{buttonText}</button>
    </div>
  );
};

export default App;