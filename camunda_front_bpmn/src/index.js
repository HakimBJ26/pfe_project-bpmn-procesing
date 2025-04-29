import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import frFR from 'antd/lib/locale/fr_FR';
import { SnackbarProvider } from 'notistack';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Configuration du thème Ant Design
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={5000}
    >
      <ConfigProvider locale={frFR} theme={theme}>
        <App />
      </ConfigProvider>
    </SnackbarProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
