// theme.js

const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  boxBackground: '#f5f5f5',
  boxBorder: '#ccc',
  answerBackground: '#e5e5e5',
  answerText: '#000000',
  placeholder: '#888',
  buttonBackground: '#007bff',
  buttonText: '#ffffff',
  adminBoxBackground: '#f5f5f5',
  adminText: '#000000',
  link: '#007bff',
}

const darkTheme = {
  background: '#000000',
  text: '#ffffff',
  boxBackground: '#111111',
  boxBorder: '#444',
  answerBackground: '#111111',
  answerText: '#ffffff',
  placeholder: '#aaa',
  buttonBackground: '#007bff',
  buttonText: '#ffffff',
  adminBoxBackground: '#222222',
  adminText: '#ffffff',
  link: '#4da3ff',
}

export const getTheme = (isDark) => (isDark ? darkTheme : lightTheme)
